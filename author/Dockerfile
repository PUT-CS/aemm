# Use the official Deno runtime image
FROM denoland/deno:alpine

# Set the working directory to where your Deno sources live
WORKDIR /app/src

# Use the non-root "deno" user provided by the base image
USER deno

# Copy only the source folder (which includes deno.json and main.ts)
COPY --chown=deno:deno src/ /app/src/

# Pre-cache dependencies (safe even if there are none)
RUN deno cache main.ts

# Run the application
CMD ["run", "--allow-net", "main.ts"]
