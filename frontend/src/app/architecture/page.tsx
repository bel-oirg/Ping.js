"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, Home } from "lucide-react"
import Link from "next/link"

export default function ArchitecturePage() {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  const handleZoom = (delta: number) => {
    setScale(prev => {
      const next = Math.max(0.5, Math.min(prev + delta, 3))
      return Math.round(next * 100) / 100
    })
  }

  const handleZoomIn = () => handleZoom(0.1)
  const handleZoomOut = () => handleZoom(-0.1)

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setLastPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    setLastPosition(position)
    document.body.style.userSelect = 'none'
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = requestAnimationFrame(() => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    document.body.style.userSelect = ''
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }, [])

  const handleDoubleClick = () => {
    handleReset()
  }

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
      setLastPosition(position)
    }
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    })
  }
  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Mouse wheel zoom support
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      // Calculate zoom direction
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      // Optional: zoom to mouse position
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const prevScale = scale;
        const nextScale = Math.max(0.5, Math.min(scale + delta, 3));
        // Calculate new position to keep zoom centered on mouse
        const scaleRatio = nextScale / prevScale;
        setPosition(pos => ({
          x: (pos.x - mouseX) * scaleRatio + mouseX,
          y: (pos.y - mouseY) * scaleRatio + mouseY
        }));
        setScale(Math.round(nextScale * 100) / 100);
      } else {
        handleZoom(delta);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">
      <div className="fixed top-4 left-4 z-30 flex items-center gap-2">
        <Link href="/">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
        </Link>
      </div>
      <Card className="fixed top-4 right-4 p-2 z-30 flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </Card>
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'box-shadow 0.2s',
        }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            willChange: 'transform',
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <img
              src="/me_.svg"
              alt="Architecture Diagram"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
                borderRadius: 12,
                boxShadow: '0 2px 16px 0 rgba(0,0,0,0.08)',
              }}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 