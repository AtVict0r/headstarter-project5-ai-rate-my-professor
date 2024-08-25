# AI Rate My Professor

This project is a web application that allows users to rate professors and get insights into their teaching styles. It leverages the power of large language models (LLMs) to provide personalized recommendations and summaries of professor reviews.

## Features

- **Professor Rating:** Users can rate professors based on various criteria, such as teaching quality, difficulty, and helpfulness.
- **Review Summarization:** LLMs are used to summarize user reviews, providing concise and informative insights into each professor's teaching style.
- **Personalized Recommendations:** Based on user preferences and ratings, the application provides personalized recommendations for professors.
- **Search Functionality:** Users can easily search for professors by name, department, or course.

## Technologies

- **Frontend:** Next.js, React, Material-UI
- **Backend:** Node.js, Express.js
- **Database:** Pinecone
- **LLM:** Google Generative AI

## Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/ai-rate-my-professor.git
```

2. **Install dependencies:**
```bash
cd ai-rate-my-professor-node
npm install

cd ../ai-rate-my-professor-python
pip install -r requirements.txt
```

3. **Set up environment variables:**
- Create a `.env` file in the root directory.
   - Add the following environment variables:
     - `PINECONE_API_KEY`: Your Pinecone API key.
     - `PINECONE_INDEX_NAME`: The name of your Pinecone index.
     - `GOOGLE_AI_API_KEY`: Your Google Generative AI API key.

4. **Run the development server:**
```bash
cd ai-rate-my-professor-node
npm run dev

pip install -r requirements.txt
python setup_rag.py
```

5. **Access the application:**
Open your web browser and go to `http://localhost:3000` to access the application.

## Contributing

Contributions are welcome! Feel free to submit pull requests, report bugs, or suggest new features.