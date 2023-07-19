import bgImage from '../../public/darkvillage.webp'
import level1 from '../../public/level1.png'
import level2 from '../../public/level2.png'


export default function Select()
{

    return(
        <main className="flex h-screen bg-cover flex-col items-center justify-center m-auto min-h-screen" style={{backgroundImage: `url(${bgImage.src})`}}>
            <div className="mb-32 space-x-2 grid content-center text-center lg:mb-0 lg:grid-cols-3 lg:text-left">
                <a
                href="/level1"
                className="group rounded-lg bg-center border border-gray-900 border-solid px-5 py-4 bg-sky-400/30 transition-colors hover:border-gray-200 hover:bg-sky-400/70"
                target="_blank"
                rel="noopener noreferrer"
                style={{backgroundImage: `url(${level1.src})`}}
                >
                    <h2 className={`mb-3 mt-20 text-2xl font-semibold text-gray-200`}>
                        Level 1: Tutorial{' '}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        -&gt;
                        </span>
                    </h2>
                    <p className={`m-0 max-w-[40ch] text-sm text-gray-200 group-hover:opacity-100 opacity-50`}>
                        Learn the basics of the game
                    </p>
                </a>

                <a
                href="/level2"
                className="group rounded-lg bg-center border border-gray-900 border-solid px-5 py-4 bg-sky-400/30 transition-colors hover:border-gray-200 hover:bg-sky-400/70"
                target="_blank"
                rel="noopener noreferrer"
                style={{backgroundImage: `url(${level2.src})`}}
                >
                    <h2 className={`mb-3 mt-20 text-2xl font-semibold text-gray-200`}>
                        Level 2: Action Points <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        -&gt;
                        </span>
                    </h2>
                    <p className={`m-0 max-w-[40ch] text-sm text-gray-200 group-hover:opacity-100 opacity-50`}>
                        Learn cooperation
                    </p>
                </a>

                <a
                href="/level3"
                className="group rounded-lg bg-center border border-gray-900 border-solid px-5 py-4 bg-sky-400/30 transition-colors hover:border-gray-200 hover:bg-sky-400/70"
                target="_blank"
                rel="noopener noreferrer"
                style={{backgroundImage: `url(${level1.src})`}}
                >
                    <h2 className={`mb-3 mt-20 text-2xl font-semibold text-gray-200`}>
                        Level 3: Challenge{' '}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        -&gt;
                        </span>
                    </h2>
                    <p className={`m-0 max-w-[40ch] text-sm text-gray-200 group-hover:opacity-100 opacity-50`}>
                        Learn to emphasise your characters' strengths
                    </p>
                </a>
            </div>
            

        </main>
    )
}