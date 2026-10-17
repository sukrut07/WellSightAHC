import json
import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk
from app.models.human_note import HumanNote
from app.models.repair import Repair
from app.schemas.generative_ui import CitationSource

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

class RetrievalService:
    @classmethod
    def search_documents(
        cls,
        db: Session,
        query: str,
        category: Optional[str] = None,
        well_type: Optional[str] = None,
        limit: int = 5
    ) -> List[CitationSource]:
        """
        Hybrid retrieval combining keyword matching, section headers, and metadata filtering.
        Returns validated CitationSource objects.
        """
        q = query.lower()
        query_words = set(w for w in q.replace(",", " ").replace(".", " ").split() if len(w) > 2)

        doc_query = db.query(DocumentChunk).join(Document)
        if category:
            doc_query = doc_query.filter(Document.category == category)
        if well_type:
            doc_query = doc_query.filter(
                (Document.applies_to_well_type == well_type) | (Document.applies_to_well_type == None)
            )

        all_chunks = doc_query.all()
        scored_chunks = []

        for chunk in all_chunks:
            text = (chunk.content or "").lower()
            section = (chunk.section_title or "").lower()
            doc_title = (chunk.document.title or "").lower()

            # Score by keyword occurrence in title, section, and text
            score = 0
            for word in query_words:
                if word in section:
                    score += 5
                if word in doc_title:
                    score += 4
                if word in text:
                    score += text.count(word)

            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort descending by relevance score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = scored_chunks[:limit]

        citations: List[CitationSource] = []
        for score, chunk in top_chunks:
            # Extract concise excerpt
            excerpt = chunk.content[:300] + ("..." if len(chunk.content) > 300 else "")
            citations.append(CitationSource(
                record_id=chunk.id,
                source_type=chunk.document.category,
                title=f"{chunk.document.title} - {chunk.section_title or 'Section'}",
                excerpt=excerpt,
                document_name=chunk.document.title,
                section_title=chunk.section_title,
                timestamp=chunk.document.created_at.isoformat() if chunk.document.created_at else None
            ))

        return citations

    @classmethod
    def search_human_notes(
        cls,
        db: Session,
        query: str,
        well_id: Optional[str] = None,
        limit: int = 5
    ) -> List[CitationSource]:
        """Searches field operator notes and human commentary."""
        q = query.lower()
        notes_query = db.query(HumanNote)
        if well_id:
            notes_query = notes_query.filter(HumanNote.well_id == well_id)
        
        notes = notes_query.all()
        matched = []
        for note in notes:
            if not q or q in note.content.lower() or q in note.category.lower():
                matched.append(note)

        citations = []
        for n in matched[:limit]:
            citations.append(CitationSource(
                record_id=n.id,
                source_type="human_note",
                title=f"Operator Note on {n.well_id} by {n.author}",
                excerpt=n.content,
                document_name="Field Operator Logs",
                section_title=n.category,
                timestamp=n.created_at.isoformat() if n.created_at else None
            ))
        return citations

    @classmethod
    def search_repair_records(
        cls,
        db: Session,
        well_id: Optional[str] = None,
        query: Optional[str] = None,
        limit: int = 5
    ) -> List[CitationSource]:
        """Searches documented repair causes and work tickets."""
        repairs_query = db.query(Repair)
        if well_id:
            repairs_query = repairs_query.filter(Repair.well_id == well_id)
        
        repairs = repairs_query.order_by(Repair.start_date.desc()).all()
        if query:
            q = query.lower()
            repairs = [r for r in repairs if q in r.documented_cause.lower() or q in r.repair_type.lower()]

        citations = []
        for r in repairs[:limit]:
            citations.append(CitationSource(
                record_id=r.id,
                source_type="repair",
                title=f"Repair {r.id}: {r.repair_type} ({r.well_id})",
                excerpt=f"Documented Cause: {r.documented_cause}. Cost: ${r.cost_usd:,.2f}. Status: {r.status}.",
                document_name=r.source_file or "Work Ticket",
                section_title=r.cause_category,
                timestamp=r.start_date
            ))
        return citations
