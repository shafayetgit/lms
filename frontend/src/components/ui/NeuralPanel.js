"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material';

const NeuralPanel = ({
    particleCount = 30,
    connectionDistance = 100,
    opacity = 0.4,
    color,
    interactive = false
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const theme = useTheme();

    // Robust color conversion for canvas
    const getRGB = (c) => {
        if (!c) return '46, 184, 46';
        if (c.startsWith('rgba') || c.startsWith('rgb')) {
            return c.replace(/rgba?\(|\)/g, '').split(',').slice(0, 3).join(',');
        }
        if (c.startsWith('#')) {
            const hex = c.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `${r}, ${g}, ${b}`;
        }
        return '46, 184, 46';
    };

    const resolvedColor = color || theme.palette.secondary.main;
    const rgb = getRGB(resolvedColor);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        const mouse = { x: null, y: null, radius: 100 };

        const resizeCanvas = () => {
            if (!containerRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            initParticles();
        };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
            }

            draw() {
                ctx.fillStyle = `rgba(${rgb}, 0.3)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (interactive && mouse.x !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= (dx / distance) * force * 2;
                        this.y -= (dy / distance) * force * 2;
                    }
                }

                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const drawLines = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const lineOpacity = (1 - (distance / connectionDistance)) * 0.15;
                        ctx.strokeStyle = `rgba(${rgb}, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawLines();
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const observer = new ResizeObserver(() => resizeCanvas());
        if (containerRef.current) observer.observe(containerRef.current);

        if (interactive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        resizeCanvas();
        animate();

        return () => {
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
            if (interactive) window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [particleCount, connectionDistance, rgb, interactive]);

    return (
        <div ref={containerRef} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
            overflow: 'hidden',
            opacity: opacity
        }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
};

export default NeuralPanel;
