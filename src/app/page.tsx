// import Link from "next/link";
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/portfolio');

  // return (
  //   <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-purple-50 via-white to-indigo-50">
  //     <div className="container mx-auto px-4 py-12">
  //       <div className="max-w-4xl mx-auto text-center">
  //         <Link 
  //           href="/portfolio" 
  //           className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
  //         >
  //           Visit Portfolio
  //         </Link>
  //       </div>
  //     </div>
  //   </div>
  // )
}