FROM lukemathwalker/cargo-chef:latest-rust-1.58.0-slim AS chef
WORKDIR /app

FROM chef AS planner
COPY server/ .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
# Build application
COPY server/ .
RUN cargo build --release

FROM node:16-slim as client-builder

WORKDIR /app
COPY client/package.json /app
COPY client/yarn.lock /app
RUN yarn

COPY client/ /app
RUN yarn build

# We do not need the Rust toolchain to run the binary!
FROM debian:buster-slim AS runtime
WORKDIR /app
COPY --from=builder /app/target/release/twmarquee /usr/local/bin
COPY --from=client-builder /app/dist /app/public
ENV ROCKET_ADDRESS=0.0.0.0
ENTRYPOINT ["/usr/local/bin/twmarquee"]
