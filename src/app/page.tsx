import Image from 'next/image'
import Link from 'next/link'
import bgImage from '../../public/darkvillage.webp'


export default function Home() {
  return (
    <main className="backdrop-blur-sm bg-cover flex min-h-screen flex-col items-center justify-between p-24" style={{backgroundImage: `url(${bgImage.src})`}}>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
          src="/loegoe.png"
          alt="Grand Illusia Logo"
          width={1034*0.75}
          height={756*0.75}
          priority
        />
      </div>

      <div className="mb-32 space-x-2 grid text-center lg:mb-0 lg:grid-cols-2 lg:text-left">

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-gray-900 border-solid px-5 py-4 bg-sky-400/30 transition-colors hover:border-gray-200 hover:bg-sky-400/70"
          target="_blank"
          rel="noopener noreferrer"
          style={{backgroundImage: "url("+bgImage+")"}}
        >
          <h2 className={`mb-3 text-2xl font-semibold text-gray-200`}>
            Discover{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm text-gray-200 group-hover:opacity-100 opacity-50`}>
            Learn about the a world of challenge and inspiration
          </p>
        </a>

        <Link
          href="/select"
          className="group rounded-lg border border-gray-900 border-transparent bg-blue-400/30 px-5 py-4 transition-colors hover:border-gray-200 hover:bg-blue-400/70"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold text-gray-200`}>
            Play{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm text-gray-200 group-hover:opacity-100 opacity-50`}>
            Close your eyes, and begin your adventure.
          </p>
        </Link>

        <Link
          href="/playtest"
          className="group rounded-lg border border-gray-900 border-transparent bg-blue-400/30 px-5 py-4 transition-colors hover:border-gray-200 hover:bg-blue-400/70"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold text-gray-200`}>
            Test{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm text-gray-200 group-hover:opacity-100 opacity-50`}>
            Try something out!
          </p>
        </Link>
      </div>
    </main>
  )
}
