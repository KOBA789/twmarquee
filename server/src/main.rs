use futures::{stream::Stream, AsyncBufReadExt, TryStreamExt};
use rocket::{
    response::stream::{Event, EventStream},
    State,
};
use clap::Parser;

mod cli;
mod rules;

#[rocket::get("/api/stream")]
fn stream(
    tx: &State<tokio::sync::broadcast::Sender<String>>,
) -> EventStream<impl Stream<Item = Event>> {
    let rx = tx.subscribe();
    let stream = futures::stream::unfold(rx, |mut rx| async move {
        use tokio::sync::broadcast::error::RecvError;
        loop {
            match rx.recv().await {
                Ok(data) => return Some((Event::data(data), rx)),
                Err(RecvError::Lagged(_)) => continue,
                _ => return None,
            }
        }
    });
    EventStream::from(stream).heartbeat(std::time::Duration::from_secs(15))
}

async fn tweet_stream(token: &str) -> impl Stream<Item = Result<String, std::io::Error>> {
    let client = reqwest::Client::new();
    let res = client
        .get("https://api.twitter.com/2/tweets/search/stream?expansions=author_id&user.fields=username&tweet.fields=text")
        .header(reqwest::header::AUTHORIZATION, format!("Bearer {token}"))
        .send()
        .await
        .unwrap();
    res.bytes_stream()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))
        .into_async_read()
        .lines()
}

#[tokio::main]
async fn main() -> Result<(), rocket::Error> {
    let cli: cli::Cli = cli::Cli::parse();

    if let Some(command) = cli.command {
        rules::run(&cli.twitter_bearer_token, command).await;
        return Ok(());
    }

    let (tx, _) = tokio::sync::broadcast::channel(100);
    let tx2 = tx.clone();
    tokio::spawn(async move {
        let tx = &tx2;
        loop {
            let stream = tweet_stream(&cli.twitter_bearer_token).await;
            let ret = stream
                .try_for_each(|data| async move {
                    println!("{data}");
                    tx.send(data).ok();
                    Ok(())
                })
                .await;
            if let Err(e) = ret {
                eprintln!("{e}");
            }
            tokio::time::sleep(std::time::Duration::from_secs(3)).await;
        }
    });

    let rocket = rocket::build()
        .manage(tx)
        .mount("/", rocket::routes![stream]);
    let rocket = if let Some(webroot) = cli.webroot {
        rocket.mount("/", rocket::fs::FileServer::from(webroot))
    } else {
        rocket
    };
    rocket.launch()
        .await
}
