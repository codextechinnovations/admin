import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Modal, FormField } from '../../components/Modal';
import { openWhatsApp, enquiryWhatsAppTemplate } from '../../utils/whatsapp';
import { useToast } from './Toast';

interface WhatsAppPreviewModalProps {
  open: boolean;
  onClose: () => void;
  phone: string;
  ownerName: string;
  /** Optional override for the message template. Defaults to the ManageYourPG enquiry template. */
  message?: string;
  /** Title shown in the modal header. */
  title?: string;
  /** Optional context line shown in the green banner. */
  context?: string;
}

export function WhatsAppPreviewModal({
  open,
  onClose,
  phone,
  ownerName,
  message,
  title = 'Send WhatsApp Message',
  context
}: WhatsAppPreviewModalProps) {
  const { showToast } = useToast();
  const [msg, setMsg] = useState<string>(message ?? enquiryWhatsAppTemplate(ownerName));

  // Re-sync local state when the modal is opened with a new target / message
  // (avoids stale text from a previous open).
  const [lastOpen, setLastOpen] = useState(false);
  if (open && !lastOpen) {
    setMsg(message ?? enquiryWhatsAppTemplate(ownerName));
    setLastOpen(true);
  }
  if (!open && lastOpen) {
    setLastOpen(false);
  }

  const send = () => {
    const trimmed = msg.trim();
    if (!trimmed) {
      showToast('error', 'Message cannot be empty');
      return;
    }
    if (!phone) {
      showToast('error', 'No phone number on record');
      return;
    }
    openWhatsApp(phone, trimmed);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10">
          <MessageCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">Message to {ownerName || 'tenant'}</p>
            <p className="text-sm text-muted-foreground">
              Sending to <span className="font-mono">{phone || '—'}</span> via WhatsApp.
              You can edit the message before sending.
            </p>
            {context && <p className="text-xs text-muted-foreground mt-1">{context}</p>}
          </div>
        </div>

        <FormField label="Message" required>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={18}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs leading-relaxed"
            placeholder="Type your WhatsApp message…"
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              This will open WhatsApp Web / App in a new tab with the message pre-filled.
            </p>
            <p className="text-xs text-muted-foreground">{msg.length} chars</p>
          </div>
        </FormField>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={send}
            disabled={!msg.trim() || !phone}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Send on WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
}
