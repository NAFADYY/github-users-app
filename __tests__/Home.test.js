// __tests__/Home.test.jsx
import { render, screen, act, fireEvent } from '@testing-library/react';
import Home from '../src/pages/Home';
import React from 'react';

// mock ghFetch
jest.mock('../src/utils/ghFetch', () => ({
    ghFetch: jest.fn(),
}));
import { ghFetch } from '../src/utils/ghFetch';

// سهّل الـ debounce في التيست (يرجع نفس القيمة فورًا)
jest.mock('../src/hooks/useDebounce', () => ({
    __esModule: true,
    default: (val) => val,
}));

// Mock IntersectionObserver مع trigger يدوي
let ioInstances = [];
beforeAll(() => {
    class IO {
        constructor(cb, options) {
            this.cb = cb;
            this.options = options;
            ioInstances.push(this);
        }
        observe = (el) => {
            this.el = el;
        };
        disconnect = () => { };
    }
    global.IntersectionObserver = IO;
});

beforeEach(() => {
    ioInstances = [];
    jest.clearAllMocks();
    // default successful fetch: بيرجع 3 يوزرز
    ghFetch.mockResolvedValue([
        { id: 1, login: 'alice', avatar_url: '', html_url: '' },
        { id: 2, login: 'bob', avatar_url: '', html_url: '' },
        { id: 3, login: 'charlie', avatar_url: '', html_url: '' },
    ]);
});

function triggerIntersect() {
    // فعّل أول observer كأنه شاف الـ sentinel
    ioInstances.forEach((io) => {
        if (io.cb) {
            io.cb([{ isIntersecting: true, target: {} }]);
        }
    });
}

test('shows skeletons then renders users after fetch', async () => {
    render(<Home />);


    expect(await screen.findAllByRole('article')).toBeTruthy(); // UserCardSkeleton articles
    // بعد ما الفetch يتم — تظهر أسماء اليوزرز
    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('charlie')).toBeInTheDocument();
});

test('filters users by search query', async () => {
    render(<Home />);
  
    await screen.findByText('alice');

    const search = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(search, { target: { value: 'ali' } });

    // يظهر alice بس
    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(screen.queryByText('bob')).toBeNull();
    expect(screen.queryByText('charlie')).toBeNull();
});

test('infinite scroll loads more on intersect', async () => {
    // أول كول يرجع 3
    ghFetch.mockResolvedValueOnce([
        { id: 1, login: 'alice', avatar_url: '', html_url: '' },
        { id: 2, login: 'bob', avatar_url: '', html_url: '' },
        { id: 3, login: 'charlie', avatar_url: '', html_url: '' },
    ]);

    // الكول التاني بيرجع 2 كمان (ids أكبر)
    ghFetch.mockResolvedValueOnce([
        { id: 4, login: 'dave', avatar_url: '', html_url: '' },
        { id: 5, login: 'eric', avatar_url: '', html_url: '' },
    ]);

    render(<Home />);
    await screen.findByText('alice');

    // فعّل الـ sentinel
    act(() => triggerIntersect());

    expect(await screen.findByText('dave')).toBeInTheDocument();
    expect(screen.getByText('eric')).toBeInTheDocument();


    expect(ghFetch).toHaveBeenCalledTimes(2);
});

test('shows error and retries', async () => {
    // أول مرّة: يرمي error
    ghFetch.mockRejectedValueOnce(new Error('Boom'));

    render(<Home />);

  
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load users|boom/i);


    ghFetch.mockResolvedValueOnce([
        { id: 99, login: 'zoe', avatar_url: '', html_url: '' },
    ]);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByText('zoe')).toBeInTheDocument();
});

test('back-to-top button appears after scrolling', async () => {
    render(<Home />);
    await screen.findByText('alice');

  
    expect(screen.queryByRole('button', { name: /back to top/i })).toBeNull();

   
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
    window.dispatchEvent(new Event('scroll'));

    expect(await screen.findByRole('button', { name: /back to top/i })).toBeInTheDocument();
});
