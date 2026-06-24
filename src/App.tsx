import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Section = 'profile' | 'works' | 'contact';
type Heading = { level: number; text: string };

function extractHeadings(markdown: string): Heading[] {
  return markdown
    .split('\n')
    .filter(line => /^#{2,3} /.test(line))
    .map(line => ({
      level: line.startsWith('### ') ? 3 : 2,
      text: line.replace(/^#{2,3} /, ''),
    }));
}

function hastText(node: any): string {
  if (!node?.children) return '';
  return node.children
    .map((c: any) => c.type === 'text' ? c.value : hastText(c))
    .join('');
}

function App() {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/content/${activeSection}.md`)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => console.error('Failed to load content:', err));
    window.scrollTo(0, 0);
  }, [activeSection]);

  const headings = useMemo(
    () => activeSection === 'works' ? extractHeadings(content) : [],
    [activeSection, content]
  );

  const navItems = [
    { id: 'profile', label: 'Home' },
    { id: 'works', label: 'Works' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 w-full h-[70px] bg-[#696969] shadow-md z-50 flex items-center justify-center px-4">
        <ul className="flex gap-8 md:gap-24">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => setActiveSection(id as Section)}
                className={cn(
                  "text-white font-medium text-lg transition-all duration-200 relative py-2 px-1",
                  "hover:text-gray-300",
                  activeSection === id && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-[#00a2ff] after:rounded-full"
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-1 mt-[70px] pb-20 px-4 md:px-0">
        <div className="max-w-4xl mx-auto mt-12 mb-12">

          <div className="prose">
            <ReactMarkdown
              components={{
                h1: ({children}) => (
                  <>
                    <h1>{children}</h1>
                    {headings.length > 0 && (
                      <nav className="mb-10 p-5 border border-gray-200 rounded-xl bg-gray-50 not-prose">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">目次</p>
                        <ul className="space-y-1">
                          {headings.map((h, i) => (
                            <li key={i}>
                              {h.level === 2 ? (
                                <span className="block text-sm font-semibold text-gray-600 mt-3 first:mt-0">
                                  {h.text}
                                </span>
                              ) : (
                                <a
                                  href={`#${h.text}`}
                                  className="block text-sm text-blue-600 hover:underline pl-4 py-0.5"
                                >
                                  {h.text}
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                  </>
                ),
                h2: ({node, children}) => (
                  <h2 id={hastText(node)}>{children}</h2>
                ),
                h3: ({node, children}) => (
                  <h3 id={hastText(node)}>{children}</h3>
                ),
                p: ({node, children}) => {
                  if (node) {
                    const nonEmpty = node.children.filter(
                      (c) => !(c.type === 'text' && c.value.trim() === '')
                    );
                    const allImages = nonEmpty.length >= 2 && nonEmpty.every(
                      (c) => c.type === 'element' && c.tagName === 'img'
                    );
                    if (allImages) {
                      return (
                        <div className="my-6 grid grid-cols-2 gap-2">
                          {children}
                        </div>
                      );
                    }
                  }
                  return <p>{children}</p>;
                },
                img: ({node, ...props}) => {
                  if (props.src?.endsWith('.mp4')) {
                    return (
                      <video
                        src={props.src}
                        controls
                        className="w-full h-auto rounded-xl shadow-lg"
                      />
                    );
                  }
                  return <img {...props} className="w-full h-auto rounded-lg" />;
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        <footer className="mt-20 py-8 border-t border-gray-300 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Koki Uchino.
        </footer>
      </main>
    </div>
  );
}

export default App;
