import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
 // Make sure to import your global CSS file

export default function Home() {
  return (
    <>
      <Head>
        <title>Savitribai Phule Shikshan Prasarak Mandal &#39; s SKN Sinhgad College of Engineering, Pandharpur - Student Assure</title>
        <meta name="description" content="Student Assure - Feedback for College Students" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen">
        <header className="bg-white shadow-md">
          <div className="container mx-auto flex justify-between items-center px-4 py-6">
            <div className="flex items-center gap-5">
              <Image src="/logoschool.jpeg" height={12} width={12} alt="Student Assure Logo" className="h-12" />
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  Savitribai Phule Shikshan Prasarak Mandal &#39; s<br />
                  SKN Sinhgad College of Engineering, Pandharpur
                </h1>
                <p>At Post : Korti, Tal : Pandharpur, Dist : Solapur, Maharashtra 413304</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/login" legacyBehavior>
                <a className="text-gray-600 hover:text-blue-500">Login</a>
              </Link>
            </nav>
          </div>
        </header>

        <main className="container mx-auto p-6">
          <section className="text-center my-12">
            <h1 className="text-5xl font-bold text-blue-500 mb-4">Welcome to Attendance System</h1>
            <p className="text-gray-600 text-lg mb-8">Efficiently track and manage student attendance with ease.</p>
            <div className="flex justify-between items-center space-x-8">
              <div className="w-1/2">
                <Image src="/5155462_2689047.svg" width={600} height={600} alt="Attendance System Illustration" className="w-full h-auto" />
              </div>
              <div className="w-1/2 text-left">
                {/* <h2 className="text-3xl font-bold text-blue-500 mb-4">About the Project</h2> */}
                <p className="text-gray-600 text-lg mb-4">
                  This Attendance System is designed to efficiently track and manage student attendance with ease.
                  It automates the attendance process, making it more convenient for teachers and students.
                </p>
                <p className="text-gray-600 text-lg mb-4">
                  Key features include automated attendance tracking, detailed attendance reports, and easy integration
                  with existing College management systems.
                </p>
                <Link href="/login" legacyBehavior>
                  <a>
                    <button className="custom-button">
                      <div className="svg-wrapper-1">
                        <div className="svg-wrapper">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                          >
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path
                              fill="currentColor"
                              d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <span>Start </span>
                    </button>
                  </a>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-white py-6 mt-12">
          <div className="container mx-auto text-center px-4">
            <p className="text-gray-600">&copy; 2024 Attendance System</p>
          </div>
        </footer>
      </div>
    </>
  );
}
