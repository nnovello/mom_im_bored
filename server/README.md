# Mom, I'm Bored! Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in this directory with the following content:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

3. Start the server:
   ```bash
   npm start
   ```

The server will run on port 5000 by default. The frontend should send POST requests to `/api/chatgpt` with the appropriate payload. 