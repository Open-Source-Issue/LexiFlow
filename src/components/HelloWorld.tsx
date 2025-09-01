import { useState } from 'react'

export default function HelloWorld(props: { msg: string }) {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center ">
      <h1 className=" font-bold text-blue-700 mb-6">{props.msg}</h1>

      <div className="card  shadow-lg rounded-lg p-6 mb-6 w-full max-w-md">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
          type="button"
          onClick={() => setCount(count + 1)}
        >
          count is {count}
        </button>
        <p className="mt-4 text-gray-600">
          Edit <code className="bg-gray-100 px-1 rounded">src/components/HelloWorld.tsx</code> to test HMR
        </p>
      </div>

      <p className="mb-2 text-gray-700">
        Check out{' '}
        <a
          href="https://github.com/crxjs/create-crxjs"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 underline hover:text-blue-700"
        >
          create-crxjs
        </a>
        , the official starter
      </p>

      <p className="read-the-docs text-sm text-gray-500">
        Click on the Vite, React and CRXJS logos to learn more
      </p>
    </div>
  )
}
