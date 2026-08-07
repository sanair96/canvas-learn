import { useEffect, useRef } from "react";

interface Star {
    x: number;
    y: number;
    radius: number;
    velocityX: number;
    velocityY: number;
    interactionVelocityX: number;
    interactionVelocityY: number;
    speed: number;
}

interface StarFieldProps {
    forceDirection: 'attract' | 'repel',
    numStars: number;
    influenceRadius: number;
    maxAcceleration: number;
    dampingFactor: number;
    innerInfluenceRadius: number;
}

export const StarField = ({ forceDirection = 'attract', numStars = 3000, influenceRadius = 50, maxAcceleration = 300, dampingFactor = 0.9, innerInfluenceRadius = 50 }: StarFieldProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const canvasContainer = useRef<HTMLDivElement>(null);
    const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const timeRef = useRef<number | null>(null);
    const pointerInOrOutRef = useRef<boolean>(false);
    const starList = useRef<Star[]>([]);

    useEffect(() => {
        if (!canvasRef.current || !canvasContainer.current) return;
        const canvas = canvasRef.current;
        const container = canvasContainer.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let width = container.clientWidth;
        let height = container.clientHeight;
        const stars = starList.current

        if(stars.length>numStars) {
            starList.current = stars.slice(0, numStars);
            return;
        }

        for (let i = stars.length; i < numStars; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.5,
                velocityX: Math.random() * 60 - 30,
                velocityY: Math.random() * 60 - 30,
                speed: Math.random() * 0.5 + 0.2,
                interactionVelocityX: 0,
                interactionVelocityY: 0,
            });
        }
    }, [numStars])

    useEffect(() => {
        if (!canvasRef.current || !canvasContainer.current) return;
        const canvas = canvasRef.current;
        const container = canvasContainer.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let width = container.clientWidth;
        let height = container.clientHeight;
        const stars = starList.current
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

        const calculateNormalizedDistance = (star: Star, pointerPos: { x: number; y: number }) => {
            let dx, dy;
            if (forceDirection === 'attract') {
                dx = pointerPos.x - star.x;
                dy = pointerPos.y - star.y;
            } else {
                dx = star.x - pointerPos.x;
                dy = star.y - pointerPos.y;
            }

            let distance = Math.hypot(dx, dy);
            return { nx: dx / distance, ny: dy / distance, distance };
        }

        const updateStar = (star: Star, pointerPos: { x: number; y: number }, deltaTime: number) => {
            const { nx, ny, distance } = calculateNormalizedDistance(star, pointerPos);
            let influence = 0
            if (distance < innerInfluenceRadius) {
                influence = distance / innerInfluenceRadius;
            } else {
                influence = (influenceRadius - distance) / (influenceRadius - innerInfluenceRadius)
            }

            if (distance < influenceRadius && pointerInOrOutRef.current && distance > 0) {
                star.interactionVelocityX += nx * influence * maxAcceleration * deltaTime;
                star.interactionVelocityY += ny * influence * maxAcceleration * deltaTime;
            }

            star.interactionVelocityX *= dampingFactor;
            star.interactionVelocityY *= dampingFactor;

            const vx = star.velocityX + star.interactionVelocityX;
            const vy = star.velocityY + star.interactionVelocityY;

            star.x += vx * deltaTime;
            star.y += vy * deltaTime;
        }

        const animate = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            const prevTime = timeRef.current || 0.05;
            timeRef.current = time;
            const deltaTime = Math.min((time - (prevTime)) / 1000, 1 / 60);

            stars.forEach((star) => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
                updateStar(star, pointerPosRef.current, deltaTime);
                if (star.y > canvas.clientHeight) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
                if (star.x > canvas.clientWidth) {
                    star.x = 0;
                    star.y = Math.random() * canvas.height;
                }
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        const mouseMoveHandler = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect(); // Get canvas size and position

            const x = event.clientX - rect.left; // Subtract left offset
            const y = event.clientY - rect.top;  // Subtract top offset
            pointerPosRef.current = { x, y };
        }

        canvas.addEventListener('mousemove', mouseMoveHandler);
        canvas.addEventListener('mouseenter', () => {
            pointerInOrOutRef.current = true;
        });
        canvas.addEventListener('mouseleave', () => {
            pointerInOrOutRef.current = false;
        });
        resizeCanvas(width, height);
        resizeHandler.observe(container);
        animate(0);

        return () => {
            resizeHandler.disconnect();
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            canvas.removeEventListener('mousemove', mouseMoveHandler);
            canvas.removeEventListener('mouseenter', () => {
                pointerInOrOutRef.current = true;
            });
            canvas.removeEventListener('mouseleave', () => {
                pointerInOrOutRef.current = false;
            });
            timeRef.current = null;
        };

    }, [forceDirection, numStars])

    return <div ref={canvasContainer} className="w-full h-full relative ">
        <canvas className="w-full h-full absolute " ref={canvasRef}>
            current stock price: $3.15 + 0.15
        </canvas>
    </div>
}

