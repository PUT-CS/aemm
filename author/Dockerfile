FROM denoland/deno:alpine

WORKDIR /app/src

# Use the non-root "deno" user provided by the base image
USER deno

# Copy only the source folder (which includes deno.json and main.ts)
COPY --chown=deno:deno src/ /app/src/

RUN deno cache main.ts

CMD ["run", "--allow-net", "main.ts"]
