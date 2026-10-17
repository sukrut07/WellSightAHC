from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.document import Document, DocumentChunk
from app.services.retrieval_service import RetrievalService
from app.schemas.generative_ui import CitationSource

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.get("/search", response_model=List[CitationSource])
def search_evidence(
    query: str = Query(..., description="Natural language search query across documents and SOPs"),
    category: Optional[str] = Query(None, description="'manual' or 'sop'"),
    well_type: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Searches chunked manuals, SOPs, and operating standards."""
    return RetrievalService.search_documents(db, query, category=category, well_type=well_type, limit=limit)

@router.get("/documents")
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "category": d.category,
            "applies_to_well_type": d.applies_to_well_type,
            "chunk_count": len(d.chunks),
            "file_path": d.file_path
        }
        for d in docs
    ]

@router.get("/documents/{doc_id}/chunks")
def get_document_chunks(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return [
        {
            "id": c.id,
            "index": c.chunk_index,
            "section_title": c.section_title,
            "content": c.content
        }
        for c in doc.chunks
    ]
