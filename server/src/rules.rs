use serde::{Deserialize, Serialize};

use crate::cli::Command;

#[derive(Serialize)]
struct AddInput {
    add: Vec<AddInputAdd>,
}

#[derive(Serialize)]
struct AddInputAdd {
    value: String,
    tag: Option<String>,
}

#[derive(Serialize)]
struct DeleteInput {
    delete: DeleteInputDelete,
}

#[derive(Serialize)]
struct DeleteInputDelete {
    ids: Vec<String>,
}

#[derive(Deserialize)]
struct AddOutput {
    #[serde(default)]
    data: Vec<RuleEntry>,
}

#[derive(Serialize, Deserialize)]
struct RuleEntry {
    id: String,
    value: String,
    tag: Option<String>,
}

#[derive(Deserialize)]
struct QueryOutput {
    #[serde(default)]
    data: Vec<RuleEntry>,
}

const ENDPOINT: &str = "https://api.twitter.com/2/tweets/search/stream/rules";

pub async fn run(twitter_bearer_token: &str, command: Command) {
    let client = reqwest::Client::new();
    match command {
        Command::Ls { quiet } => {
            let output: QueryOutput = client
                .get(ENDPOINT)
                .header(
                    reqwest::header::AUTHORIZATION,
                    format!("Bearer {}", twitter_bearer_token),
                )
                .send()
                .await
                .expect("Failed to request")
                .json()
                .await
                .expect("Failed to parse");
            if quiet {
                for entry in output.data {
                    println!("{}", entry.id);
                }
            } else {
                for entry in output.data {
                    println!("{}", serde_json::to_string(&entry).unwrap());
                }
            }
        }
        Command::Add { values, tag, quiet } => {
            let input = AddInput {
                add: values
                    .into_iter()
                    .map(|value| AddInputAdd {
                        value,
                        tag: tag.clone(),
                    })
                    .collect(),
            };
            let output: AddOutput = client
                .post(ENDPOINT)
                .header(
                    reqwest::header::AUTHORIZATION,
                    format!("Bearer {}", twitter_bearer_token),
                )
                .json(&input)
                .send()
                .await
                .expect("Failed to request")
                .json()
                .await
                .expect("Failed to parse");
            if quiet {
                for entry in output.data {
                    println!("{}", entry.id);
                }
            } else {
                for entry in output.data {
                    println!("{}", serde_json::to_string(&entry).unwrap());
                }
            }
        }
        Command::Delete { ids } => {
            let input = DeleteInput {
                delete: DeleteInputDelete { ids },
            };
            client
                .post(ENDPOINT)
                .header(
                    reqwest::header::AUTHORIZATION,
                    format!("Bearer {}", twitter_bearer_token),
                )
                .json(&input)
                .send()
                .await
                .expect("Failed to request");
        }
    }
}
