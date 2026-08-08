import { useEffect, useRef } from "react";
import type { DrawConfig } from "../route";



type Coordinate = {
    x: number,
    y: number
}

const pointerInit = {
    x: 0, y: 0
}

type DrawnShapes = {
    x: number,
    y: number,
    width: number,
    height: number,
    shape: 'rect' | 'circ',
    radii: number,
    strokeWidth: number
}


const DrawArea = ({ shape = 'rect', radii = 10, strokeWidth = 10 }: DrawConfig) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainer = useRef<HTMLDivElement>(null);

    const pointerStartRef = useRef<Coordinate>({ ...pointerInit });
    const pointerEndRef = useRef<Coordinate>({ ...pointerInit })
    const isDrawing = useRef<boolean>(false);
    const drawnShapesRef = useRef<Record<number, DrawnShapes[]>>({})
    const animationFrameRef = useRef<number | null>(null);
    useEffect(() => {
        if (!canvasRef.current || !canvasContainer.current) return;
        const canvas = canvasRef.current;
        const container = canvasContainer.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        let width = container.clientWidth;
        let height = container.clientHeight;
        const drawnShapes = drawnShapesRef.current;

        const drawRect = (rect: DrawnShapes) => {
            ctx.moveTo(rect.x, rect.y)

            ctx.roundRect(rect.x, rect.y, rect.width, rect.height, rect.radii);
        }

        const drawCirc = (circ: DrawnShapes) => {
            const radius = Math.hypot(circ.width, circ.height);
            ctx.moveTo(circ.x+radius, circ.y)
            ctx.arc(circ.x, circ.y, radius, 0, 2*Math.PI, true)
        }

        const handleDraw = (shape: DrawnShapes) => {
            switch (shape.shape) {
                case 'rect':
                    drawRect(shape)
                    break;
                case 'circ':
                    drawCirc(shape)
            }
        }

        const drawAllShapes = () => {
            ctx.clearRect(
                0,
                0,
                canvas.clientWidth,
                canvas.clientHeight,
            );
            for (let width in drawnShapes) {
                ctx.beginPath();
                ctx.lineWidth = parseInt(width);
                for (let rect of drawnShapes[width]) {
                    handleDraw(rect);
                }
                ctx.stroke();
            }

            if (isDrawing.current) {
                ctx.beginPath()
                ctx.lineWidth = strokeWidth
                const { x: sx, y: sy } = pointerStartRef.current
                const { x: ex, y: ey } = pointerEndRef.current
                const currShape: DrawnShapes = {
                    x: sx, y: sy, width: ex-sx, height: ey-sy, radii, shape, strokeWidth
                }
    
                handleDraw(currShape);
                ctx.stroke();
            }

            animationFrameRef.current = requestAnimationFrame(drawAllShapes);
        }


        const getPointerPosition = (
            event: PointerEvent,
        ) => {
            const rect = canvas.getBoundingClientRect();

            return {
                fx: event.clientX - rect.left,
                fy: event.clientY - rect.top,
            };
        };

        const resizeCanvas = (width: number, height: number) => {
            const dpr = window.devicePixelRatio || 1;
            const targetWidth = width * dpr;
            const targetHeight = height * dpr;

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.clearRect(0, 0, targetWidth, targetHeight);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        const resizeHandler = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const { width: nextWidth, height: nextHeight } = entry.contentRect;
            if (nextWidth === width && nextHeight === height) return;

            width = nextWidth;
            height = nextHeight;
            resizeCanvas(width, height);
        })

        const handlePointerDown = (event: PointerEvent) => {
            const { fx, fy } = getPointerPosition(event);
            pointerStartRef.current = { x: fx, y: fy };
            pointerEndRef.current = { x: fx, y: fy };

            isDrawing.current = true;
        }
        canvas.addEventListener('pointerdown', handlePointerDown)

        const handlePointerMove = (event: PointerEvent) => {
            if (isDrawing.current) {
                const { fx, fy } = getPointerPosition(event);


                pointerEndRef.current = { x: fx, y: fy };
            }
        }
        canvas.addEventListener('pointermove', handlePointerMove);

        const handlePointerUp = (event: PointerEvent) => {
            if (isDrawing.current) {
                const { fx, fy } = getPointerPosition(event);

                const startPointer = pointerStartRef.current
                pointerEndRef.current = { x: fx, y: fy };
                const current = drawnShapes[strokeWidth] || [];
                const width = fx - startPointer.x;
                const height = fy - startPointer.y;
                const circleRadius = Math.hypot(width, height);
                if (width > 5 || height > 5 || width < -5 || height < -5 || (circleRadius>5 && shape==='circ')) {
                    current.push({
                        x: startPointer.x,
                        y: startPointer.y,
                        shape,
                        width: fx - startPointer.x,
                        height: fy - startPointer.y,
                        radii,
                        strokeWidth
                    });
                }
                drawnShapes[strokeWidth] = current;
                isDrawing.current = false;
                pointerStartRef.current = { ...pointerInit };
                pointerEndRef.current = { ...pointerInit }
            }
        }
        canvas.addEventListener('pointerup', handlePointerUp)

        resizeHandler.observe(container);
        resizeCanvas(width, height);
        drawAllShapes();
        return () => {
            canvas.removeEventListener('pointerup', handlePointerUp)
            canvas.removeEventListener('pointermove', handlePointerMove)
            canvas.removeEventListener('pointerdown', handlePointerDown)
            if (animationFrameRef.current)
                cancelAnimationFrame(animationFrameRef.current)
        }
    }, [shape, radii, strokeWidth])

    return <div className='w-screen h-screen' ref={canvasContainer}>
        <canvas className='w-full h-full' ref={canvasRef}>
        </canvas>
    </div>



}

export default DrawArea