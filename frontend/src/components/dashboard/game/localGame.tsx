"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/card";


const LOGICAL_WIDTH = 600;
const LOGICAL_HEIGHT = 400;

const BALL_RADIUS = 10;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 90;
const PADDLE_SPEED = 5;
const BALL_START_SPEED = 4;
const BALL_NORMAL_SPEED = 8;
const WIN_SCORE = 5;
const MIN_BOUNCE_ANGLE = (20 * Math.PI) / 180;
const MAX_BOUNCE_ANGLE = (60 * Math.PI) / 180;

interface GameProps {
	players: { player1: string; player2: string };
	onGameEnd: (winner: string) => void;
}

export default function Game({ players, onGameEnd }: GameProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const scaleX = useRef(1);
	const scaleY = useRef(1);
	const firstBounceDone = useRef(false);

	const [isGameOver, setIsGameOver] = useState(false);

	const input = useRef({ w: false, s: false, up: false, down: false });

	const game = useRef({
		leftY: LOGICAL_HEIGHT / 2 - PADDLE_HEIGHT / 2,
		rightY: LOGICAL_HEIGHT / 2 - PADDLE_HEIGHT / 2,
		ballX: LOGICAL_WIDTH / 2,
		ballY: LOGICAL_HEIGHT / 2,
		ballVX: (Math.random() < 0.5 ? -1 : 1) * BALL_START_SPEED,
		ballVY: 0,
		scoreL: 0,
		scoreR: 0,
		BallSpeed: BALL_START_SPEED
	});

	const resizeCanvas = () => {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!canvas || !ctx) return;

		const aspect = 3 / 2;
		let w = window.innerWidth * 0.9;
		let h = w / aspect;
		if (h > window.innerHeight * 0.8) {
			h = window.innerHeight * 0.8;
			w = h * aspect;
		}
		canvas.width = w;
		canvas.height = h;
		scaleX.current = w / LOGICAL_WIDTH;
		scaleY.current = h / LOGICAL_HEIGHT;
	};

	const resetBall = (dir: "left" | "right") => {
		game.current.ballX = LOGICAL_WIDTH / 2;
		game.current.ballY = LOGICAL_HEIGHT / 2;
		game.current.ballVX = (dir === "left" ? -1 : 1) * BALL_START_SPEED;
		game.current.ballVY = 0;
		game.current.BallSpeed = BALL_START_SPEED;
	};


	const drawBackground = (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => {
		const g = ctx.createLinearGradient(0, 0, c.width, c.height);
		g.addColorStop(0, "#000");
		g.addColorStop(0.5, "#111");
		g.addColorStop(1, "#000");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, c.width, c.height);

		ctx.setLineDash([10, 10]);
		ctx.strokeStyle = "#00ffff";
		ctx.lineWidth = 2;
		ctx.shadowColor = "#00ffff";
		ctx.shadowBlur = 10;
		ctx.beginPath();
		ctx.moveTo(c.width / 2, 0);
		ctx.lineTo(c.width / 2, c.height);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.shadowBlur = 0;
	};

	const drawPaddles = () => {
		const ctx = ctxRef.current;
		const c = canvasRef.current;
		if (!ctx || !c) return;

		const sx = scaleX.current;
		const sy = scaleY.current;
		const leftX = 1 * sx;
		const rightX = (LOGICAL_WIDTH - PADDLE_WIDTH - 1) * sx;
		const { leftY, rightY } = game.current;

		[[leftX, leftY], [rightX, rightY]].forEach(([x, y]) => {
			ctx.fillStyle = "white";
			ctx.fillRect(x, y * sy, PADDLE_WIDTH * sx, PADDLE_HEIGHT * sy);
		});
	};

	const drawBall = () => {
		const ctx = ctxRef.current;
		if (!ctx) return;
		const { ballX, ballY } = game.current;
		const r = BALL_RADIUS * Math.min(scaleX.current, scaleY.current);
		const dx = ballX * scaleX.current;
		const dy = ballY * scaleY.current;

		const g = ctx.createRadialGradient(dx, dy, r * 0.2, dx, dy, r);
		g.addColorStop(0, "#fff");
		g.addColorStop(1, "#00ffff");
		ctx.fillStyle = g;
		ctx.shadowColor = "#00ffff";
		ctx.shadowBlur = 15;
		ctx.beginPath();
		ctx.arc(dx, dy, r, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0;
	};

	const drawScores = () => {
		const ctx = ctxRef.current;
		const c = canvasRef.current;
		if (!ctx || !c) return;
		const { scoreL, scoreR } = game.current;
		ctx.font = "bold 36px 'Press Start 2P', monospace";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "black";
		ctx.shadowBlur = 8;
		ctx.fillText(scoreL.toString(), c.width * 0.25, c.height * 0.1);
		ctx.fillText(scoreR.toString(), c.width * 0.75, c.height * 0.1);
		ctx.shadowBlur = 0;
	};

	const drawFrame = () => {
		const ctx = ctxRef.current;
		const c = canvasRef.current;
		if (!ctx || !c) return;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, c.width, c.height);
		drawBackground(ctx, c);
		drawBall();
		drawPaddles();
		drawScores();
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctxRef.current = ctx;

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		const kd = (e: KeyboardEvent) => {
			if (e.key === "w") input.current.w = true;
			if (e.key === "s") input.current.s = true;
			if (e.key === "ArrowUp") input.current.up = true;
			if (e.key === "ArrowDown") input.current.down = true;
		};
		const ku = (e: KeyboardEvent) => {
			if (e.key === "w") input.current.w = false;
			if (e.key === "s") input.current.s = false;
			if (e.key === "ArrowUp") input.current.up = false;
			if (e.key === "ArrowDown") input.current.down = false;
		};

		window.addEventListener("keydown", kd);
		window.addEventListener("keyup", ku);

		let animId: number;
		const loop = () => {
			if (input.current.w) game.current.leftY -= PADDLE_SPEED;
			if (input.current.s) game.current.leftY += PADDLE_SPEED;
			if (input.current.up) game.current.rightY -= PADDLE_SPEED;
			if (input.current.down) game.current.rightY += PADDLE_SPEED;

			game.current.leftY = Math.max(0, Math.min(LOGICAL_HEIGHT - PADDLE_HEIGHT, game.current.leftY));
			game.current.rightY = Math.max(0, Math.min(LOGICAL_HEIGHT - PADDLE_HEIGHT, game.current.rightY));

			game.current.ballX += game.current.ballVX;
			game.current.ballY += game.current.ballVY;

			if (game.current.ballY - BALL_RADIUS < 0) {
				game.current.ballY = BALL_RADIUS + 2;
				game.current.ballVY *= -1;
			}
			else if (game.current.ballY + BALL_RADIUS > LOGICAL_HEIGHT) {
				game.current.ballY = LOGICAL_HEIGHT - BALL_RADIUS - 2;
				game.current.ballVY *= -1;
			}


			const handlePaddleBounce = (isLeft: boolean) => {
				game.current.BallSpeed = BALL_NORMAL_SPEED;
				const paddleY = isLeft ? game.current.leftY : game.current.rightY;
				let rel = (game.current.ballY - paddleY - PADDLE_HEIGHT / 2) / (PADDLE_HEIGHT / 2);
				rel = Math.max(-1, Math.min(1, rel));
				const angle = rel * ((MAX_BOUNCE_ANGLE - MIN_BOUNCE_ANGLE) / 2) + (rel >= 0 ? MIN_BOUNCE_ANGLE : -MIN_BOUNCE_ANGLE);

				game.current.ballVX = (isLeft ? 1 : -1) * Math.cos(angle) * game.current.BallSpeed;
				game.current.ballVY = Math.sin(angle) * game.current.BallSpeed;
			};



			if (game.current.ballX - BALL_RADIUS < PADDLE_WIDTH + 1) {
				if (game.current.ballY > game.current.leftY && game.current.ballY < game.current.leftY + PADDLE_HEIGHT) {
					handlePaddleBounce(true);
					game.current.ballX = PADDLE_WIDTH + BALL_RADIUS + 2;
				} else {
					game.current.scoreR++;
					if (game.current.scoreR >= WIN_SCORE) {
						setIsGameOver(true);
						onGameEnd(players.player2);
						return;
					}
					resetBall("right");
				}
			}

			if (game.current.ballX + BALL_RADIUS > LOGICAL_WIDTH - PADDLE_WIDTH - 1) {
				if (game.current.ballY > game.current.rightY && game.current.ballY < game.current.rightY + PADDLE_HEIGHT) {
					handlePaddleBounce(false);
					game.current.ballX = LOGICAL_WIDTH - PADDLE_WIDTH - BALL_RADIUS - 2;
				} else {
					game.current.scoreL++;
					if (game.current.scoreL >= WIN_SCORE) {
						setIsGameOver(true);
						onGameEnd(players.player1);
						return;
					}
					resetBall("left");
				}
			}

			drawFrame();
			if (!isGameOver) animId = requestAnimationFrame(loop);
		};
		animId = requestAnimationFrame(loop);

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			window.removeEventListener("keydown", kd);
			window.removeEventListener("keyup", ku);
			cancelAnimationFrame(animId);
		};
	}, [isGameOver, players, onGameEnd]);


	useEffect(() => {
		const preventScroll = (e: TouchEvent) => e.preventDefault();

		document.body.style.overflow = 'hidden';
		document.body.style.height = '100%';
		document.documentElement.style.overflow = 'hidden';
		document.documentElement.style.height = '100%';
		window.scrollTo(0, 0);
		document.addEventListener('touchmove', preventScroll, { passive: false });

		return () => {
			document.body.style.overflow = 'auto';
			document.body.style.height = '';
			document.documentElement.style.overflow = 'auto';
			document.documentElement.style.height = '';
			document.removeEventListener('touchmove', preventScroll);
		};
	}, []);

	return (
		<div className="relative w-full flex justify-center">
			<canvas ref={canvasRef} className="bg-black block mx-auto rounded-lg shadow-lg" />
			{isGameOver && (
				<Button
					onClick={() => {
						game.current.scoreL = 0;
						game.current.scoreR = 0;
						setIsGameOver(false);
					}}
					className="absolute top-1/2 translate-y-20 px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-press-start rounded"
				>
					Play Again
				</Button>
			)}
		</div>
	);
}