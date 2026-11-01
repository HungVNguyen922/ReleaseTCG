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
    describeZone,
    otherSeat,
    peekIds,
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

    /** Set when the menu was opened on a pile/stack itself rather than a card. */
    zone: ZoneKey | null;
}

/** A limited look at the top or bottom of a pile or stack. */
export interface PeekState {
    zone: ZoneKey;
    side: "top" | "bottom";
    ids: string[];
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

    openMenu: (
        x: number,
        y: number,
        cardIds: string[],
        zone?: ZoneKey | null,
    ) => void;

    closeMenu: () => void;

    /** Full view of a zone (reveals every card). */
    browsing: ZoneKey | null;

    browse: (zone: ZoneKey | null) => void;

    /** Look at only the top or bottom `count` cards of a zone. */
    peek: PeekState | null;

    openPeek: (zone: ZoneKey, side: "top" | "bottom", count: number) => void;

    closePeek: () => void;

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

    const [peek, setPeek] = useState<PeekState | null>(null);

    const [preview, setPreview] = useState<PlayableCard | null>(null);

    const passDevice = useCallback(() => {

        const next = otherSeat(viewer);

        setViewer(next);
        setCoverFor(next);
        setSelected([]);
        setMenu(null);
        setBrowsing(null);
        setPeek(null);
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

    const openMenu = useCallback((
        x: number,
        y: number,
        cardIds: string[],
        zone: ZoneKey | null = null,
    ) => {
        setMenu({ x, y, cardIds, zone });
    }, []);

    const closeMenu = useCallback(() => setMenu(null), []);

    const browse = useCallback((zone: ZoneKey | null) => {
        setBrowsing(zone);
        setPeek(null);
        setMenu(null);
        setSelected([]);
    }, []);

    const openPeek = useCallback((
        zone: ZoneKey,
        side: "top" | "bottom",
        count: number,
    ) => {

        const ids = peekIds(game.getState(), zone, side, count);

        setMenu(null);
        setSelected([]);

        if (ids.length === 0) {
            return;
        }

        setBrowsing(null);

        setPeek({ zone, side, ids });

        // Visible to both players in the log, so nobody peeks in secret.
        game.note(
            `${viewer} looked at the ${side} ${ids.length === 1 ? "card" : `${ids.length} cards`} of ${describeZone(zone)}`,
        );

    }, [game, viewer]);

    const closePeek = useCallback(() => setPeek(null), []);

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
                setPeek(null);
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
        peek,
        openPeek,
        closePeek,
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
        peek,
        openPeek,
        closePeek,
        preview,
        onExit,
    ]);

    return (
        <SandboxContext.Provider value={value}>
            {children}
        </SandboxContext.Provider>
    );

}
