use clap::{Parser, Subcommand};

#[derive(Parser)]
pub struct Cli {
    #[clap(long, env)]
    pub twitter_bearer_token: String,
    #[clap(long, short)]
    pub webroot: Option<String>,
    #[clap(subcommand)]
    pub command: Option<Command>,
}

#[derive(Subcommand)]
pub enum Command {
    /// List the rules
    Ls {
        #[clap(long, short)]
        /// Only display rule ID
        quiet: bool,
    },
    /// Add rules
    Add {
        #[clap(long, short)]
        /// Name a tag
        tag: Option<String>,
        #[clap(long, short)]
        /// Only print rule ID on success
        quiet: bool,
        values: Vec<String>,
    },
    /// Delete the rules
    Delete { ids: Vec<String> },
}
