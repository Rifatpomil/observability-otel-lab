# Vector store implementation for Retrieval‑Augmented Generation (RAG)
# ---------------------------------------------------------------
# This module loads product review documents, creates embeddings using a free
# open‑source sentence‑transformer model, and stores them in a FAISS index.
# It provides a simple ``search(query, top_k)`` function that returns the most
# relevant product IDs and their summaries.
# ---------------------------------------------------------------

import os
import json
import logging
from typing import List, Tuple

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Initialise logger
logger = logging.getLogger(__name__)

# Path to the JSON file containing review summaries
DEFAULT_SUMMARIES_PATH = os.path.join(os.path.dirname(__file__), "product-review-summaries", "product-review-summaries.json")

# Load a lightweight embedding model – completely free and runs on CPU.
# ``all-MiniLM-L6-v2`` is ~80 MB and provides good quality for short texts.
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

class ReviewVectorStore:
    def __init__(self, summaries_path: str = DEFAULT_SUMMARIES_PATH):
        self.summaries_path = summaries_path
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        self.index = None  # type: faiss.IndexFlatL2
        self.id_to_summary = {}
        self._load_and_index()

    def _load_and_index(self):
        """Load JSON summaries and build a FAISS index.

        The JSON file is expected to have the shape:
        {
            "product-review-summaries": [
                {"product_id": "ABC123", "product_review_summary": "..."},
                ...
            ]
        }
        """
        if not os.path.exists(self.summaries_path):
            logger.error(f"Summaries file not found: {self.summaries_path}")
            return
        with open(self.summaries_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        summaries = data.get("product-review-summaries", [])
        texts = []
        ids = []
        for entry in summaries:
            pid = entry.get("product_id")
            summary = entry.get("product_review_summary")
            if pid and summary:
                ids.append(pid)
                texts.append(summary)
                self.id_to_summary[pid] = summary
        if not texts:
            logger.warning("No review summaries loaded for vector store.")
            return
        # Compute embeddings (shape: N x D)
        embeddings = self.embedding_model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        # Normalise for cosine similarity (FAISS works with L2 distance)
        embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dim)
        self.index.add(embeddings.astype(np.float32))
        self.ids = ids
        logger.info(f"Vector store built with {len(ids)} product summaries.")

    def search(self, query: str, top_k: int = 3) -> List[Tuple[str, str]]:
        """Return a list of ``(product_id, summary)`` tuples most relevant to *query*.
        """
        if self.index is None:
            logger.error("Vector store not initialised.")
            return []
        q_vec = self.embedding_model.encode([query], convert_to_numpy=True)
        q_vec = q_vec / np.linalg.norm(q_vec, axis=1, keepdims=True)
        distances, indices = self.index.search(q_vec.astype(np.float32), top_k)
        results = []
        for idx in indices[0]:
            pid = self.ids[idx]
            results.append((pid, self.id_to_summary.get(pid, "")))
        return results

# Global singleton – loaded once at import time (fast for dev, acceptable for demo)
review_store = ReviewVectorStore()

def search_reviews(query: str, top_k: int = 3) -> List[Tuple[str, str]]:
    """Convenient wrapper used by the Flask app.
    """
    return review_store.search(query, top_k)
