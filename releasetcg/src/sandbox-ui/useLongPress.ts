"use client";

import { useRef, type TouchEvent } from "react";

const MOVE_TOLERANCE = 10;

/**
 * Touch screens have no right-click, so a long press stands in for it.
 * Spread the result onto an element. Moving the finger, lifting early or
 * starting a drag cancels it; a press that fires also swallows the tap.
 */
export function useLongPress(
    onLongPress: (x: number, y: number) => void,
    delay = 400,
) {

    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const origin = useRef<{ x: number; y: number } | null>(null);

    const fired = useRef(false);

    function cancel() {

        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }

    }

    return {

        cancel,

        handlers: {

            onTouchStart(event: TouchEvent) {

                // Keep an enclosing zone from also starting its own press.
                event.stopPropagation();

                cancel();

                fired.current = false;

                if (event.touches.length !== 1) {
                    return;
                }

                const touch = event.touches[0];

                origin.current = { x: touch.clientX, y: touch.clientY };

                timer.current = setTimeout(() => {
                    fired.current = true;
                    timer.current = null;
                    onLongPress(touch.clientX, touch.clientY);
                }, delay);

            },

            onTouchMove(event: TouchEvent) {

                const touch = event.touches[0];

                if (
                    origin.current &&
                    touch &&
                    Math.hypot(
                        touch.clientX - origin.current.x,
                        touch.clientY - origin.current.y,
                    ) > MOVE_TOLERANCE
                ) {
                    cancel();
                }

            },

            onTouchEnd(event: TouchEvent) {

                cancel();

                if (fired.current) {
                    // The menu is already open; don't also treat it as a tap.
                    event.preventDefault();
                    fired.current = false;
                }

            },

            onTouchCancel: cancel,

        },

    };

}
