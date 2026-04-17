"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material';

const NeuralBackground = () => {
    const canvasRef = useRef(null);
    const theme = useTheme();
    const primaryColor = theme.palette.secondary.main; // Using the Green color for LMS

    // Robust color conversion for canvas
    const getRGB = (color) => {
        if (!color) return '46, 184, 46';
        if (color.startsWith('rgba') || color.startsWith('rgb')) {
            return color.replace(/rgba?\(|\)/g, '').split(',').slice(0, 3).join(',');
        }
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `${r}, ${g}, ${b}`;
        }
        return '46, 184, 46';
    };

    const rgb = getRGB(primaryColor);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let particles = [];
        const particleCount = 120;
        const connectionDistance = 160;
        const mouse = { x: null, y: null, radius: 180 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                const speedMultiplier = this.size * 0.2;
                this.speedX = (Math.random() - 0.5) * speedMultiplier;
                this.speedY = (Math.random() - 0.5) * speedMultiplier;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.pulseDir = Math.random() > 0.5 ? 1 : -1;
                this.pulseSpeed = Math.random() * 0.01;
            }

            draw() {
                ctx.shadowBlur = this.size * 2;
                ctx.shadowColor = `rgba(${rgb}, 0.5)`;
                ctx.fillStyle = `rgba(${rgb}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity += this.pulseDir * this.pulseSpeed;
                if (this.opacity > 0.7 || this.opacity < 0.2) this.pulseDir *= -1;

                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= (dx / distance) * force * 3;
                        this.y -= (dy / distance) * force * 3;
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
                        const lineOpacity = (1 - (distance / connectionDistance)) * 0.2;
                        ctx.strokeStyle = `rgba(${rgb}, ${lineOpacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.closePath();

                        if (Math.random() > 0.9995) {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                            ctx.beginPath();
                            ctx.arc(particles[i].x + dx * 0.5, particles[i].y + dy * 0.5, 1.5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            drawLines();
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [rgb]);

    return (
        <canvas
            ref={canvasRef}
            id="neural-background-canvas"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: -1,
                opacity: 0.6
            }}
        />
    );
};

export default NeuralBackground;
