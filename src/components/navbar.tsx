import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full h-[60px]">
      <div className="flex gap-2 px-4 w-full max-w-[520px] h-full items-center justify-between mx-auto">
        <Link href="/" className="w-auto">
          <LaCryptaIso className="w-auto h-[30px]" />
          {/* <img src='https://placehold.co/120x50' alt='' width={120} height={50} /> */}
        </Link>
        {/* <div className='h-full flex items-center gap-2 ml-4'>
                <Select defaultValue='SAT'>
                  <SelectTrigger className='w-auto'>
                    <SelectValue placeholder='Price' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='SAT'>SAT</SelectItem>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='ARS'>ARS</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
      </div>
    </nav>
  );
}

function LaCryptaIso(props: any) {
  return (
    <svg
      {...props}
      width="143"
      height="161"
      viewBox="0 0 143 161"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M143.01 101.13V86.29H89.04V71.45H143C142.98 31.98 110.98 0 71.5 0C32.01 0 0 32.01 0 71.5V160.48H143.01V145.64H29.68V130.8H143.01V115.96H59.35V101.12H143.01V101.13Z"
        fill="currentColor"
      />
    </svg>
  );
}
