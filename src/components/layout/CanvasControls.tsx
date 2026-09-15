import { Minus, Plus, Maximize2, ChevronUp, ChevronDown, PanelLeft } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { MAX_ZOOM, MIN_ZOOM } from '../../constants/editor';

interface Props {
  zoom: number;
  currentPage: number;
  pageCount: number;
  showThumbnails: boolean;
  onZoomChange: (zoom: number) => void;
  onFitWidth: () => void;
  onPageChange: (page: number) => void;
  onToggleThumbnails: () => void;
}

export function CanvasControls({
  zoom,
  currentPage,
  pageCount,
  showThumbnails,
  onZoomChange,
  onFitWidth,
  onPageChange,
  onToggleThumbnails,
}: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-1.5 py-1 shadow-[var(--shadow-lg)]">
        <IconButton tone="chrome" size="sm" label="Toggle page thumbnails" active={showThumbnails} onClick={onToggleThumbnails}>
          <PanelLeft size={15} />
        </IconButton>
        <div className="mx-1 h-5 w-px bg-[var(--chrome-border)]" />
        <IconButton
          tone="chrome"
          size="sm"
          label="Previous page"
          disabled={currentPage <= 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronUp size={15} />
        </IconButton>
        <span className="min-w-[64px] text-center text-[12px] tabular-nums text-[var(--chrome-text)]">
          Page {currentPage + 1} / {pageCount}
        </span>
        <IconButton
          tone="chrome"
          size="sm"
          label="Next page"
          disabled={currentPage >= pageCount - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronDown size={15} />
        </IconButton>
        <div className="mx-1 h-5 w-px bg-[var(--chrome-border)]" />
        <IconButton
          tone="chrome"
          size="sm"
          label="Zoom out"
          onClick={() => onZoomChange(Math.max(MIN_ZOOM, +(zoom - 0.1).toFixed(2)))}
        >
          <Minus size={15} />
        </IconButton>
        <span className="min-w-[42px] text-center text-[12px] tabular-nums text-[var(--chrome-text)]">
          {Math.round(zoom * 100)}%
        </span>
        <IconButton
          tone="chrome"
          size="sm"
          label="Zoom in"
          onClick={() => onZoomChange(Math.min(MAX_ZOOM, +(zoom + 0.1).toFixed(2)))}
        >
          <Plus size={15} />
        </IconButton>
        <IconButton tone="chrome" size="sm" label="Fit to width" onClick={onFitWidth}>
          <Maximize2 size={15} />
        </IconButton>
      </div>
    </div>
  );
}
