import React, { CSSProperties, ReactNode } from 'react';
import { useAdmin } from './AdminContext';

/** Зүүн талын жагсаалт (aside). */
export function ListPanel({ header, countLabel, loading, hideScrollbar = true, children }: {
  header?: ReactNode;
  countLabel: string;
  loading: boolean;
  hideScrollbar?: boolean;
  children: ReactNode;
}) {
  return (
    <aside className="admin-list">
      {header}
      <div className="admin-count">{countLabel}</div>
      <div
        className="admin-list-items"
        style={hideScrollbar ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
      >
        {loading ? <p className="admin-muted">Уншиж байна...</p> : children}
      </div>
    </aside>
  );
}

/** Жагсаалтын нэг мөр. */
export function ListItem({ active, onClick, thumb, thumbStyle, title, subtitle }: {
  active: boolean;
  onClick: () => void;
  thumb: ReactNode;
  thumbStyle?: CSSProperties;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <button className={`admin-list-item ${active ? 'active' : ''}`} type="button" onClick={onClick}>
      <div className="admin-list-thumb" style={thumbStyle}>{thumb}</div>
      <div className="admin-list-text">
        <span>{title}</span>
        <small>{subtitle}</small>
      </div>
    </button>
  );
}

/** Засварлагчийн толгой: kicker, гарчиг, "Устгах" товч. */
export function EditorHeader({ kicker, title, onDelete }: {
  kicker: string;
  title: string;
  onDelete?: () => void;
}) {
  return (
    <div className="admin-editor-head">
      <div>
        <span className="admin-kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {onDelete && (
        <button className="admin-danger" type="button" onClick={onDelete}>Устгах</button>
      )}
    </div>
  );
}

/** Алдаа/амжилтын мессеж + "Хадгалах" товч. onSave өгөхгүй бол submit товч болно. */
export function EditorFooter({ saving, onSave }: { saving: boolean; onSave?: () => void }) {
  const { error, status } = useAdmin();
  return (
    <>
      {error && <p className="admin-error">{error}</p>}
      {status && <p className="admin-success">{status}</p>}
      <div className="admin-submit">
        <button
          className="admin-primary"
          type={onSave ? 'button' : 'submit'}
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </div>
    </>
  );
}

/** Таб идэвхгүй үед нуух style (state хадгалагдана). */
export const tabVisibility = (active: boolean): CSSProperties | undefined =>
  active ? undefined : { display: 'none' };
