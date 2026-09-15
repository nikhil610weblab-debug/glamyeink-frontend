import { useCallback, useEffect, useRef, useState } from 'react';

type Point = { x: number; y: number };
type Stroke = Point[];

export function useSignatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
  const redoStack = useRef<Stroke[]>([]);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const sync = () => {
    setIsEmpty(strokes.current.length === 0);
    setCanUndo(strokes.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.6 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#171B21';
    for (const stroke of strokes.current) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * dpr, stroke[0].y * dpr);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x * dpr, stroke[i].y * dpr);
      }
      ctx.stroke();
    }
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    redraw();
  }, [redraw]);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    redoStack.current = [];
    strokes.current.push([getPoint(e)]);
    canvasRef.current?.setPointerCapture(e.pointerId);
    sync();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    strokes.current[strokes.current.length - 1].push(getPoint(e));
    redraw();
  };

  const onPointerUp = () => {
    drawing.current = false;
    sync();
  };

  const clear = () => {
    strokes.current = [];
    redoStack.current = [];
    redraw();
    sync();
  };

  const undo = () => {
    const last = strokes.current.pop();
    if (last) redoStack.current.push(last);
    redraw();
    sync();
  };

  const redo = () => {
    const next = redoStack.current.pop();
    if (next) strokes.current.push(next);
    redraw();
    sync();
  };

  const toTransparentPng = (): string | null => {
    if (!canvasRef.current || isEmpty) return null;
    return canvasRef.current.toDataURL('image/png');
  };

  return { canvasRef, onPointerDown, onPointerMove, onPointerUp, clear, undo, redo, isEmpty, canUndo, canRedo, toTransparentPng };
}
