
"use client";

import { useEffect, useRef, useContext, useState } from "react";
import { GameSocketContext } from "@/context/GameSocket"
import { useBarContext } from "@/context/BarContext";
import { isMobile } from "react-device-detect";
import { dashboardService } from "@/lib/api/index"
import { UserCardResponse } from "@/types/Dashboard"
import { useView } from "@/context/GameView";
import { getStoredProfile, storeProfileData, isProfileDataValid } from '@/utils/profileStorage'
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Score {
	left: number;
	right: number;
}

type GameState = {
	LeftY: number;
	RightY: number;
	BallX: number;
	BallY: number;
	Score: Score;
};


type PlayerData = {
	avatar: string,
	username: string
}


const LOGICAL_WIDTH = 600;
const LOGICAL_HEIGHT = 400;

const scalableGameOptions = {
	BallRadius: 10,
	PaddleWidth: 10,
	PaddleHeight: 90,
};

export default function Game() {
	const [avatarVersion, setAvatarVersion] = useState(Date.now());
	const socket = useContext(GameSocketContext);
	const sideOnServerRef = useRef<"left" | "right" | "">("");
	const [isGameOver, setIsGameOver] = useState(false);
	const message = useRef<string>("Waiting for players...");
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const [username, setUsername] = useState<string>('')
	const [avatar, setAvatar] = useState<string | null>(null)
	const [userId, setUserId] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const prevAvatarRef = useRef<string | null>(null);
	const [mounted, setMounted] = useState(false)

	const [myData, setMyData] = useState<PlayerData>({ username: "", avatar: "data/avatars/default.png" });
	const [oponentData, setOponentData] = useState<PlayerData>({ username: "", avatar: "data/avatars/default.png" });


	const { setShowSidebar } = useBarContext();
	const { setView } = useView();

	const scaleX = useRef(1);
	const scaleY = useRef(1);

	const currentState = useRef<GameState>({
		LeftY: 150,
		RightY: 150,
		BallX: LOGICAL_WIDTH / 2,
		BallY: LOGICAL_HEIGHT / 2,
		Score: { left: 0, right: 0 },
	});

	const previousState = useRef<GameState | null>(null);
	const lastUpdateTime = useRef<number>(performance.now());
	const [hasStarted, setHasStarted] = useState(false);

	const inputState = { up: false, down: false };


	function gameOverDisplay() {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!ctx || !canvas) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBackground(ctx, canvas, false);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		drawScores();
		displayMessage(message.current, 28);
	}

	function displayMessage(text: string, fontSize = 30, clear = false) {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!canvas || !ctx) return;
		if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "white";
		ctx.font = `${getScaledFontSize(fontSize)}px 'Press Start 2P'`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);
	}

	function drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, drawLine: boolean = true) {
		const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, "#000000");
		gradient.addColorStop(0.5, "#111111");
		gradient.addColorStop(1, "#000000");

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (drawLine) {
			ctx.setLineDash([10, 10]);
			ctx.strokeStyle = "#00ffff";
			ctx.lineWidth = 2;
			ctx.shadowColor = "#00ffff";
			ctx.shadowBlur = 10;
			ctx.beginPath();
			ctx.moveTo(canvas.width / 2, 0);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.shadowBlur = 0;
		}
	}

	function drawBall(x: number, y: number) {
		const ctx = ctxRef.current;
		if (!ctx) return;
		const sx = scaleX.current;
		const sy = scaleY.current;
		const radius = scalableGameOptions.BallRadius * Math.min(sx, sy);
		const drawX = x * sx;
		const drawY = y * sy;
		const gradient = ctx.createRadialGradient(drawX, drawY, radius * 0.2, drawX, drawY, radius);
		gradient.addColorStop(0, "#ffffff");
		gradient.addColorStop(1, "#00ffff");
		ctx.fillStyle = gradient;
		ctx.shadowColor = "#00ffff";
		ctx.shadowBlur = 15;
		ctx.beginPath();
		ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0;
	}

	function drawPaddles(leftY: number, rightY: number) {
		const ctx = ctxRef.current;
		const state = currentState.current;
		const options = scalableGameOptions;
		if (!ctx) return;

		const paddles = [
			{
				x: state.Score.left !== undefined ? 1 : 1, // left paddle x fixed
				y: leftY,
				color: sideOnServerRef.current === "left" ? "#ff5555" : "white",
			},
			{
				x: LOGICAL_WIDTH - options.PaddleWidth - 1, // right paddle x fixed
				y: rightY,
				color: sideOnServerRef.current === "right" ? "#ff5555" : "white",
			},
		];

		for (const p of paddles) {
			ctx.fillStyle = p.color;
			const width = options.PaddleWidth * scaleX.current;
			const height = options.PaddleHeight * scaleY.current;
			const radius = 6;
			const drawX = p.x * scaleX.current;
			const drawY = p.y * scaleY.current;

			ctx.beginPath();
			ctx.moveTo(drawX + radius, drawY);
			ctx.lineTo(drawX + width - radius, drawY);
			ctx.quadraticCurveTo(drawX + width, drawY, drawX + width, drawY + radius);
			ctx.lineTo(drawX + width, drawY + height - radius);
			ctx.quadraticCurveTo(drawX + width, drawY + height, drawX + width - radius, drawY + height);
			ctx.lineTo(drawX + radius, drawY + height);
			ctx.quadraticCurveTo(drawX, drawY + height, drawX, drawY + height - radius);
			ctx.lineTo(drawX, drawY + radius);
			ctx.quadraticCurveTo(drawX, drawY, drawX + radius, drawY);
			ctx.fill();
		}
	}

	function drawScores() {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!ctx || !canvas) return;

		const state = currentState.current;
		const side = sideOnServerRef.current;

		const percentX = (p: number) => (p / 100) * canvas.width;
		const percentY = (p: number) => (p / 100) * canvas.height;

		ctx.font = `bold ${getScaledFontSize(36)}px 'Press Start 2P'`;
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "black";
		ctx.shadowBlur = 8;

		ctx.fillText(state.Score.left.toString(), percentX(side === "left" ? 40 : 60), percentY(10));
		ctx.fillText(state.Score.right.toString(), percentX(side === "left" ? 60 : 40), percentY(10));

		ctx.shadowBlur = 0;
	}

	async function fetchAndSetOponentAvatar(id: number) {

		const res: UserCardResponse = await dashboardService.getCard(id.toString());
		setOponentData({
			avatar: res.data?.User.avatar || "data/avatars/default.png",
			username: res.data?.User.username || ""
		})
	}


	function drawFrame(ballX: number, ballY: number, leftY: number, rightY: number) {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!ctx || !canvas) return;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (sideOnServerRef.current === "left") {
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
		}

		drawBackground(ctx, canvas);
		drawBall(ballX, ballY);
		drawPaddles(leftY, rightY);

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		drawScores();
	}

	function getScaledFontSize(baseSize: number, minSize = 12, maxSize = 36): number {
		const canvas = canvasRef.current;
		if (!canvas) return baseSize;
		const scale = canvas.height / LOGICAL_HEIGHT;
		const scaledSize = baseSize * scale;
		return Math.max(minSize, Math.min(scaledSize, maxSize));
	}

	const resizeCanvas = () => {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!ctx || !canvas) return;

		const aspectRatio = 3 / 2;
		let width = window.innerWidth * 0.9;
		let height = width / aspectRatio;

		if (height > window.innerHeight * 0.8) {
			height = window.innerHeight * 0.8;
			width = height * aspectRatio;
		}

		canvas.width = width;
		canvas.height = height;
		scaleX.current = width / LOGICAL_WIDTH;
		scaleY.current = height / LOGICAL_HEIGHT;

		ctx.clearRect(0, 0, width, height);

		if (isGameOver)
			gameOverDisplay();
	};

	const sendInput = () => socket?.emit("game:paddle", inputState);

	const keyDownEvent = (e: KeyboardEvent) => {
		if (e.key === "ArrowUp") inputState.up = true;
		if (e.key === "ArrowDown") inputState.down = true;
		sendInput();
	};

	const keyUpEvent = (e: KeyboardEvent) => {
		if (e.key === "ArrowUp") inputState.up = false;
		if (e.key === "ArrowDown") inputState.down = false;
		sendInput();
	};
	const normalizeAvatarUrl = (url?: string, version?: number) => {
		if (typeof url === 'string') {
		  let newUrl = url;
		  let shouldNormalize = false;
		  if (newUrl.includes('/dash/media/avatarUpload')) {
			newUrl = newUrl.replace('/dash/media/avatarUpload', 'https://blackholejs.art/avatars');
			shouldNormalize = true;
		  } else if (newUrl.includes('/media/avatarUpload')) {
			newUrl = newUrl.replace('/media/avatarUpload', 'https://blackholejs.art/avatars');
			shouldNormalize = true;
		  }
		  if (shouldNormalize && version) {
			return `${newUrl}?cb=${version}`;
		  }
		  return newUrl;
		}
		return url;
	  };
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctxRef.current = ctx;


		const { avatar, username } = JSON.parse(localStorage.getItem("blackhole_user_profile") || "{}");
		setMyData({ avatar: avatar || "data/avatars/default.png", username: username || "player" });


		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);
		window.addEventListener("keydown", keyDownEvent);
		window.addEventListener("keyup", keyUpEvent);

		socket?.on("game:message", (msg: string) => {
			displayMessage(msg, 30, true);
		});
		socket?.on("game:init", (event) => {
			sideOnServerRef.current = event.side;
			fetchAndSetOponentAvatar(event.oponentId);

		});

		socket?.on("game:update", (event) => {
			previousState.current = { ...currentState.current };
			lastUpdateTime.current = performance.now();
			currentState.current.BallX = event.ball.x;
			currentState.current.BallY = event.ball.y;
			currentState.current.LeftY = event.left;
			currentState.current.RightY = event.right;
			currentState.current.Score.left = event.score.left;
			currentState.current.Score.right = event.score.right;

			if (!hasStarted) setHasStarted(true);
		});

		socket?.on("game:over", (resultMessage: string) => {
			message.current = `Game Over: ${resultMessage}`;
			setIsGameOver(true);
		});

		socket?.emit("room:join", { roomid: sessionStorage.getItem("roomId") });

		let animationFrameId: number;

		const renderLoop = () => {
			if (!hasStarted) {
				animationFrameId = requestAnimationFrame(renderLoop);
				return;
			}

			if (isGameOver) {
				gameOverDisplay();
				return;
			}

			const now = performance.now();
			const delta = Math.min((now - lastUpdateTime.current) / 100, 1);
			const prev = previousState.current;
			const curr = currentState.current;

			let ballX = curr.BallX;
			let ballY = curr.BallY;
			let leftY = curr.LeftY;
			let rightY = curr.RightY;

			if (prev) {
				ballX = prev.BallX + (curr.BallX - prev.BallX) * delta;
				ballY = prev.BallY + (curr.BallY - prev.BallY) * delta;
				leftY = prev.LeftY + (curr.LeftY - prev.LeftY) * delta;
				rightY = prev.RightY + (curr.RightY - prev.RightY) * delta;
			}

			drawFrame(ballX, ballY, leftY, rightY);

			animationFrameId = requestAnimationFrame(renderLoop);
		};
		renderLoop();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			window.removeEventListener("keydown", keyDownEvent);
			window.removeEventListener("keyup", keyUpEvent);
			cancelAnimationFrame(animationFrameId);
		};
	}, [hasStarted, isGameOver]);

	useEffect(() => {
		const fetchProfileData = async () => {
			if (mounted && typeof window !== 'undefined') {
				const storedProfile = getStoredProfile();

				if (storedProfile && isProfileDataValid()) {
					setUsername(storedProfile.username);
					setAvatar(storedProfile.avatar);
					setUserId(storedProfile.id);
					setIsLoading(false);
					if (prevAvatarRef.current !== storedProfile.avatar) {
						setAvatarVersion(Date.now());
						prevAvatarRef.current = storedProfile.avatar;
					}
					return;
				}
				setIsLoading(true);
				try {
					const response = await dashboardService.getCard();
					if (response.status.success && response.data) {
						const { User } = response.data;
						setUsername(User.username);
						setAvatar(User.avatar);
						setUserId(User.id);
						storeProfileData(response.data);
					}
				} catch (err) {
					toast.error('game profile error');
				} finally {
					setIsLoading(false);
				}
			}
		};
		fetchProfileData();
	}, [mounted]);

	useEffect(() => {
		const preventScroll = (e: TouchEvent) => e.preventDefault();

		// Lock scroll
		document.body.style.overflow = 'hidden';
		document.body.style.height = '100%';
		document.documentElement.style.overflow = 'hidden';
		document.documentElement.style.height = '100%';
		window.scrollTo(0, 0);
		document.addEventListener('touchmove', preventScroll, { passive: false });
		setShowSidebar(false);

		return () => {
			// Unlock scroll
			document.body.style.overflow = 'auto';
			document.body.style.height = '';
			document.documentElement.style.overflow = 'auto';
			document.documentElement.style.height = '';
			document.removeEventListener('touchmove', preventScroll);
			setShowSidebar(true);
		};
	}, []);


	return (
		<div className="fixed inset-0 flex items-center justify-center bg-muted p-4">
			<div className="flex flex-col items-center gap-4">
				<div className="flex justify-between w-full max-w-[640px] px-4">
					<div className="flex flex-col items-center">
						<Avatar className="w-12 h-12 md:w-16 md:h-16 rounded-full border-1 border-gray-500 shadow">
							{oponentData.avatar ? (
								<AvatarImage src={normalizeAvatarUrl(oponentData.avatar, avatarVersion)} alt={oponentData.username}  />
							) : (
								<AvatarImage src="/data/avatars/default.png" alt={oponentData.username} />
							)}
						</Avatar>
						<p className="mt-1 text-white text-xs md:text-sm font-mono">{oponentData.username}</p>
					</div>
					<div className="flex flex-col items-center">
						<Avatar className="w-12 h-12 md:w-16 md:h-16 rounded-full border-1 border-gray-500 shadow">
							{myData.avatar ? (
								<AvatarImage src={normalizeAvatarUrl(myData.avatar, avatarVersion)} alt={myData.username} />
							) : (
								<AvatarImage src="/data/avatars/default.png" alt={myData.username} />
							)}
						</Avatar>
						<p className="mt-1 text-white text-xs md:text-sm font-mono">{myData.username}</p>
					</div>
				</div>

				<canvas
					ref={canvasRef}
					className="bg-black rounded-lg shadow-lg"
					width={640}
					height={480}
				/>

				{isMobile && !isGameOver && (
					<div className="flex flex-row justify-center gap-6 mt-4">
						<button
							onTouchStart={() => {
								inputState.up = true;
								sendInput();
							}}
							onTouchEnd={() => {
								inputState.up = false;
								sendInput();
							}}
							className="w-16 h-16 md:w-20 md:h-20 bg-gray-700 text-white text-3xl rounded-lg"
						>
							⬆️
						</button>
						<button
							onTouchStart={() => {
								inputState.down = true;
								sendInput();
							}}
							onTouchEnd={() => {
								inputState.down = false;
								sendInput();
							}}
							className="w-16 h-16 md:w-20 md:h-20 bg-gray-700 text-white text-3xl rounded-lg"
						>
							⬇️
						</button>
					</div>
				)}

				{isGameOver && (
					<>
						{isMobile ? (
							<div className="w-full flex justify-center mt-6">
								<button
									onClick={() => {
										setView("menu");
										setShowSidebar(true);
									}}
									className="px-8 py-4 bg-black text-cyan-400 border-2 border-cyan-400 font-['Press_Start_2P'] text-sm shadow-[0_0_10px_#00ffff] hover:bg-cyan-700 hover:text-black transition-all duration-200"
									style={{ textTransform: "uppercase", letterSpacing: "1px" }}
								>
									Lobby
								</button>
							</div>
						) : (
							<div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
								<button
									onClick={() => {
										setView("menu");
										setShowSidebar(true);
									}}
									className="px-6 py-3 rounded-md bg-muted text-white border border-gray-600 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 shadow-md font-mono text-sm"
								>
									Lobby
								</button>

							</div>
						)}
					</>
				)}
			</div>
		</div>
	);

}

