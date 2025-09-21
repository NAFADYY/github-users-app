
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

export default function PerPageSelect({
    value,
    onChange,
    options = [5, 8, 10],
    labelSuffix = " / page",
}) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const btnRef = useRef(null);
    const listRef = useRef(null);

    // اغلاق بالضغط خارج/ESC
    useEffect(() => {
        const onDocClick = (e) => {
            if (!wrapRef.current?.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    // تركيز أول عنصر عند الفتح
    useEffect(() => {
        if (open) {
            const el = listRef.current?.querySelector("[role='option'][data-active]");
            (el || listRef.current?.firstChild)?.focus();
        }
    }, [open]);

    const setVal = (n) => {
        onChange(n);
        setOpen(false);
        btnRef.current?.focus();
    };

    const handleKeyNav = (e) => {
        const items = Array.from(
            listRef.current?.querySelectorAll("[role='option']") || []
        );
        const idx = items.findIndex((el) => el === document.activeElement);
        if (e.key === "ArrowDown") {
            e.preventDefault();
            items[Math.min(idx + 1, items.length - 1)]?.focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            items[Math.max(idx - 1, 0)]?.focus();
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const v = Number(document.activeElement?.dataset?.value);
            if (!Number.isNaN(v)) setVal(v);
        }
    };

    return (
        <div className="select-wrap" ref={wrapRef}>
            <button
                type="button"
                className="select-trigger"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                ref={btnRef}
            >
                <span>{value}{labelSuffix}</span>
                <FiChevronDown className="select-caret" aria-hidden />
            </button>

            {open && (
                <ul
                    className="select-menu"
                    role="listbox"
                    aria-label="Items per page"
                    ref={listRef}
                    onKeyDown={handleKeyNav}
                >
                    {options.map((n) => {
                        const selected = n === value;
                        return (
                            <li
                                key={n}
                                role="option"
                                aria-selected={selected}
                                tabIndex={0}
                                data-value={n}
                                data-active={selected ? true : undefined}
                                className={`select-item${selected ? " is-selected" : ""}`}
                                onClick={() => setVal(n)}
                            >
                                <span>{n}{labelSuffix}</span>
                                {selected && <FiCheck className="select-check" aria-hidden />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
