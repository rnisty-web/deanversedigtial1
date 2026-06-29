"use client";

import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { Button } from "@/components/ui/Button";

type ClientOption = { id: string; name: string; email: string };
type ProjectOption = { id: string; title: string; client_id: string };

type MessagesComposeModalProps = {
  open: boolean;
  onClose: () => void;
  clients: ClientOption[];
  projects: ProjectOption[];
  clientId: string;
  projectId: string;
  subject: string;
  content: string;
  sending: boolean;
  error: string | null;
  onClientChange: (id: string) => void;
  onProjectChange: (id: string) => void;
  onSubjectChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function MessagesComposeModal({
  open,
  onClose,
  clients,
  projects,
  clientId,
  projectId,
  subject,
  content,
  sending,
  error,
  onClientChange,
  onProjectChange,
  onSubjectChange,
  onContentChange,
  onSubmit,
}: MessagesComposeModalProps) {
  const filteredProjects = clientId
    ? projects.filter((p) => p.client_id === clientId)
    : projects;

  return (
    <AdminModal open={open} onClose={onClose} title="New message" size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text)]">Client</label>
          <select
            value={clientId}
            onChange={(e) => {
              onClientChange(e.target.value);
              onProjectChange("");
            }}
            className="admin-messages-select w-full"
            required
          >
            <option value="">Select client…</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text)]">Project (optional)</label>
          <select
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="admin-messages-select w-full"
            disabled={!clientId}
          >
            <option value="">No project</option>
            {filteredProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <AdminField label="Subject" value={subject} onChange={onSubjectChange} />
        <AdminField label="Message" value={content} onChange={onContentChange} multiline rows={5} />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="admin-btn-gold"
            disabled={sending || !clientId || !content.trim()}
          >
            {sending ? "Sending…" : "Send message"}
          </Button>
        </div>
      </form>
    </AdminModal>
  );
}
