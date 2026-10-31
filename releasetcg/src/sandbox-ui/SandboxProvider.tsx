"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import type { PlayableCard } from "@/types/cards";

import {
    otherSeat,
    type MoveOptions,
    type SandboxGame,
    type SandboxState,
    type SeatId,
    type ZoneKey,
} from "@/lib/sandbox";

export const DRAG_MIME = "application/x-sandbox-cards";

export interface CardMenuState {
    x: number;
    y: number;
    cardIds: string[];
}

interface SandboxContextValue {

    game: SandboxGame;

    state: SandboxState;

    /** Whose hand is face up on this screen. */
    viewer: SeatId;

    /** Set while the device is being handed to the other player. */
    coverFor: SeatId | null;

    passDevice: () => void;

    revealToViewer: () => void;

    selected: string[];

    toggleSelect: (cardId: string) => void;

    clearSelection: () => void;

    /** Move cards (or the current selection, if they're part of it). */
    dropCards: (
        cardIds: string[],
        zone: ZoneKey,
        options?: MoveOptions,
    ) => void;

    menu: CardMenuState | null;

    openMenu: (x: number, y: number, cardIds: string[]) => void;

    closeMenu: () => void;

    browsing: ZoneKey | null;

    browse: (zone: ZoneKey | null) => void;

    preview: PlayableCard | null;

    setPreview: (card: PlayableCard | null) => void;

    exit: () => void;

}

const SandboxContext = createContext<SandboxContextValue | null>(null);

export function useSandbox(): SandboxContextValue {

    const value = useContext(SandboxContext);

    if (!value) {
        throw new Error("useSandbox must be used inside <SandboxProvider>.");
    }

    return value;

}

interface Props {
    game: SandboxGame;
    onExit: () => void;
    children: ReactNode;
}

export function SandboxProvider({ game, onExit, children }: Props) {

    const state = useSyncExternalStore(
        game.subscribe,
        game.getState,
        game.getState,
    );

    const [viewer, setViewer] = useState<SeatId>("P1");

    const [coverFor, setCoverFor] = useState<SeatId | null>(null);

    const [selected, setSelected] = useState<string[]>([]);

    const [menu, setMenu] = useState<CardMenuState | null>(null);

    const [browsing, setBrowsing] = useState<ZoneKey | null>(null);

    const [preview, setPreview] = useState<PlayableCard | null>(null);

    const passDevice = useCallback(() => {

        const next = otherSeat(viewer);

        setViewer(next);
        setCoverFor(next);
        setSelected([]);
        setMenu(null);
        setBrowsing(null);
        setPreview(null);

    }, [viewer]);

    const revealToViewer = useCallback(() => setCoverFor(null), []);

    const toggleSelect = useCallback((cardId: string) => {

        setSelected(current =>
            current.includes(cardId)
                ? current.filter(id => id !== cardId)
                : [...current, cardId],
        );

    }, []);

    const clearSelection = useCallback(() => setSelected([]), []);

    const dropCards = useCallback((
        cardIds: string[],
        zone: ZoneKey,
        options?: MoveOptions,
    ) => {

        game.move(cardIds, zone, options);

        setSelected([]);

    }, [game]);

    const openMenu = useCallback((x: number, y: number, cardIds: string[]) => {
        setMenu({ x, y, cardIds });
    }, []);

    const closeMenu = useCallback(() => setMenu(null), []);

    const browse = useCallback((zone: ZoneKey | null) => {
        setBrowsing(zone);
        setMenu(null);
        setSelected([]);
    }, []);

    useEffect(() => {

        function onKeyDown(event: KeyboardEvent) {

            const target = event.target as HTMLElement | null;

            if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
                return;
            }

            if (event.key === "Escape") {
                setMenu(null);
                setSelected([]);
                setBrowsing(null);
                return;
            }

            const mod = event.ctrlKey || event.metaKey;

            if (mod && event.key.toLowerCase() === "z") {

                event.preventDefault();

                if (event.shiftKey) {
                    game.redo();
                } else {
                    game.undo();
                }

            } else if (mod && event.key.toLowerCase() === "y") {

                event.preventDefault();

                game.redo();

            }

        }

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);

    }, [game]);

    const value = useMemo<SandboxContextValue>(() => ({
        game,
        state,
        viewer,
        coverFor,
        passDevice,
        revealToViewer,
        selected,
        toggleSelect,
        clearSelection,
        dropCards,
        menu,
        openMenu,
        closeMenu,
        browsing,
        browse,
        preview,
        setPreview,
        exit: onExit,
    }), [
        game,
        state,
        viewer,
        coverFor,
        passDevice,
        revealToViewer,
        selected,
        toggleSelect,
        clearSelection,
        dropCards,
        menu,
        openMenu,
        closeMenu,
        browsing,
        browse,
        preview,
        onExit,
    ]);

    return (
        <SandboxContext.Provider value={value}>
            {children}
        </SandboxContext.Provider>
    );

}
