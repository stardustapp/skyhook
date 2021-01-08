FROM hayd/alpine-deno:1.6.2
WORKDIR /src

ADD src/deps.ts .
RUN ["deno", "cache", "deps.ts"]

ADD src/ .
RUN ["deno", "cache", "--unstable", "mod.ts"]

CMD ["deno", "run", "--allow-net", "--allow-env", "--unstable", "--cached-only", "mod.ts"]
