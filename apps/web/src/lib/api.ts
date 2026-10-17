import { CopilotMessage, VisualSpecUnion, CitationSource, ConflictNotice } from '@/types/generative-ui';

/**
 * Resolves API Base URL dynamically supporting:
 * 1. Vercel Services multi-service binding (`process.env.API_URL`) in server runtime.
 * 2. Client-side relative routing (`/api`) matching Vercel top-level rewrites.
 * 3. Environment override via `NEXT_PUBLIC_API_URL`.
 * 4. Local development fallback to `http://localhost:8000/api`.
 */
export function getApiBaseUrl(): string {
  // Server-side (Node runtime / Server Components / Route Handlers)
  if (typeof window === 'undefined') {
    if (process.env.API_URL) {
      return `${process.env.API_URL.replace(/\/$/, '')}/api`;
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    }
    return 'http://localhost:8000/api';
  }

  // Client-side environment override
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // In the browser:
  // On Vercel / production, the top-level rewrite in vercel.json routes /api/(.*) to the api service.
  // In standalone local dev (port 3000), target localhost:8000 if not proxied.
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }

  return '/api';
}

function getBase(): string {
  return getApiBaseUrl();
}

export interface WellItem {
  id: string;
  name: string;
  area: string;
  field: string;
  well_type: string;
  target_formation: string;
  latitude?: number;
  longitude?: number;
  commissioned_date?: string;
  status: string;
  measured_downtime_days: number;
  recent_inspections_count: number;
  active_repairs_count: number;
  spills_count: number;
  active_conflicts_count: number;
  accepted_corrections_count: number;
}

export interface InspectionItem {
  id: string;
  date: string;
  inspector?: string;
  ambient_temp_f: number;
  wellhead_temp_f: number;
  delta_t_f: number;
  surface_pressure_psi?: number;
  observed_status: string;
  is_missed: boolean;
  notes?: string;
}

export interface RepairItem {
  id: string;
  start_date: string;
  end_date?: string;
  repair_type: string;
  cause_category: string;
  documented_cause: string;
  cost_usd: number;
  technician?: string;
  status: string;
}

export interface CorrectionItem {
  id: string;
  scope: string;
  target_id: string;
  target_field: string;
  original_value: string;
  corrected_value: string;
  author: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  applies_to_well_type?: string;
  chunk_count: number;
  file_path?: string;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${getBase()}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getWells(params?: { area?: string; well_type?: string; status?: string; search?: string }): Promise<{ wells: WellItem[]; total_count: number }> {
    const searchParams = new URLSearchParams();
    if (params?.area) searchParams.set('area', params.area);
    if (params?.well_type) searchParams.set('well_type', params.well_type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);

    const res = await fetch(`${getBase()}/wells?${searchParams.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch wells');
    return res.json();
  },

  async getWell(id: string): Promise<WellItem> {
    const res = await fetch(`${getBase()}/wells/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch well ${id}`);
    return res.json();
  },

  async getWellInspections(id: string): Promise<InspectionItem[]> {
    const res = await fetch(`${getBase()}/wells/${id}/inspections`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch inspections');
    return res.json();
  },

  async getWellRepairs(id: string): Promise<RepairItem[]> {
    const res = await fetch(`${getBase()}/wells/${id}/repairs`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch repairs');
    return res.json();
  },

  async sendChatMessage(payload: {
    message: string;
    conversation_id?: string;
    user_id: string;
    override_visual_type?: string;
  }) {
    const res = await fetch(`${getBase()}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Chat request failed');
    }
    return res.json();
  },

  async getConversations(userId: string) {
    const res = await fetch(`${getBase()}/copilot/conversations?user_id=${encodeURIComponent(userId)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async getConversation(id: string, userId: string) {
    const res = await fetch(`${getBase()}/copilot/conversations/${id}?user_id=${encodeURIComponent(userId)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load conversation');
    return res.json();
  },

  async getCorrections(params?: { scope?: string; status?: string; target_id?: string }): Promise<{ corrections: CorrectionItem[]; total_count: number }> {
    const searchParams = new URLSearchParams();
    if (params?.scope) searchParams.set('scope', params.scope);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.target_id) searchParams.set('target_id', params.target_id);

    const res = await fetch(`${getBase()}/corrections?${searchParams.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch corrections');
    return res.json();
  },

  async createCorrection(payload: {
    scope: string;
    target_id: string;
    target_field: string;
    corrected_value: string;
    author: string;
    reason: string;
  }) {
    const res = await fetch(`${getBase()}/corrections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit correction');
    }
    return res.json();
  },

  async updateCorrectionStatus(id: string, status: string) {
    const res = await fetch(`${getBase()}/corrections/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async getConflicts(wellId?: string): Promise<ConflictNotice[]> {
    const url = wellId ? `${getBase()}/audit/conflicts?well_id=${encodeURIComponent(wellId)}` : `${getBase()}/audit/conflicts`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async getAuditEvents(): Promise<any[]> {
    const res = await fetch(`${getBase()}/audit/events`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async getIngestionJobs(): Promise<any[]> {
    const res = await fetch(`${getBase()}/audit/ingestion-jobs`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${getBase()}/evidence/documents`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async getDocumentChunks(docId: string): Promise<any[]> {
    const res = await fetch(`${getBase()}/evidence/documents/${docId}/chunks`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async searchEvidence(query: string): Promise<CitationSource[]> {
    const res = await fetch(`${getBase()}/evidence/search?query=${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async getDowntimeAnalytics(area = 'Area A') {
    const res = await fetch(`${getBase()}/analytics/downtime?area=${encodeURIComponent(area)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load downtime analytics');
    return res.json();
  },

  async getHeatmapAnalytics() {
    const res = await fetch(`${getBase()}/analytics/heatmap`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load heatmap data');
    return res.json();
  },

  async getSpillsAnalytics() {
    const res = await fetch(`${getBase()}/analytics/spills`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load spill analytics');
    return res.json();
  },

  async getRepairsAnalytics(area?: string) {
    const url = area ? `${getBase()}/analytics/repairs?area=${encodeURIComponent(area)}` : `${getBase()}/analytics/repairs`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load repair analytics');
    return res.json();
  },

  async getSharedContext(wellId: string) {
    const res = await fetch(`${getBase()}/memory/shared/${wellId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async addSharedContext(wellId: string, author: string, key: string, value: string) {
    const res = await fetch(`${getBase()}/memory/shared/${wellId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, key, value }),
    });
    if (!res.ok) throw new Error('Failed to save shared context');
    return res.json();
  },

  async getPrivateContext(userId: string) {
    const res = await fetch(`${getBase()}/memory/private/${userId}?requesting_user_id=${encodeURIComponent(userId)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async reingestData(path = './data') {
    const res = await fetch(`${getBase()}/ingestion/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) throw new Error('Failed to trigger ingestion');
    return res.json();
  },
};
