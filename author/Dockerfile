FROM denoland/deno:alpine

WORKDIR /app

# Use the non-root "deno" user provided by the base image
USER deno

# Copy only the source folder (which includes deno.json and main.ts)
COPY --chown=deno:deno ./ ./

RUN deno cache src/main.ts

CMD ["run", "--allow-net", "src/main.ts"]
