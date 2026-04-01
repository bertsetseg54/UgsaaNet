import React from 'react';
// ArrowLeft-ийг энд нэмж оруулснаар алдаа засагдана
import { 
  UserPlus, 
  GitFork, 
  BookOpen, 
  Share2, 
  Play, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react';

const Work = () => {
  const steps = [
    {
      title: "1. Системд нэвтрэх",
      description: "Өөрийн бүртгэлээр нэвтэрч ороод, хамгийн эхний хүнийг (өвөг дээдэс эсвэл өөрийгөө) модон дээрээ нэмнэ.",
      icon: UserPlus,
      bg: "bg-blue-50",
      color: "text-blue-600"
    },
    {
      title: "2. Удмаа үргэлжлүүлэх",
      description: "Шинээр хүн нэмэхдээ 'Эцэг/Эх' талбарт өмнө нь бүртгэсэн хүний нэрийг сонгосноор хүүхэд нь болон холбогдоно.",
      icon: GitFork,
      bg: "bg-green-50",
      color: "text-green-600"
    },
    {
      title: "3. Түүх, намтар баяжуулах",
      description: "Тухайн хүний 'Түүх намтар' хэсэг рүү орж, хамтдаа бүтээсэн дурсамжаа зурагтай нь хамт оруулж үлдээнэ.",
      icon: BookOpen,
      bg: "bg-amber-50",
      color: "text-amber-600"
    },
    {
      title: "4. Хадгалах & Хуваалцах",
      description: "Бэлэн болсон ургийн бичгээ гэр бүлийнхэнтэйгээ хамтран хөтлөх эсвэл файлаар татаж авна.",
      icon: Share2,
      bg: "bg-purple-50",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Back Button Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <a 
          href="/start" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group font-medium"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Буцах
        </a>
      </div>

      {/* Header Section */}
      <section className="relative pt-12 pb-12 px-4 sm:px-6 lg:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-6">
            Гарын авлага
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Цахим ургийн бичгийг <br className="hidden sm:block" /> 
            <span className="text-blue-600">хялбархан</span> хөтлөх заавар
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Удмын түүхээ дижитал хэлбэрт оруулах нь тийм ч хэцүү биш. Та ердөө дараах дөрвөн алхмыг дагахад хангалттай.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Steps */}
          <div className="flex-1 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <ChevronRight className="w-5 h-5 text-blue-600" />
              Ашиглах дараалал
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                    <div className="flex items-start gap-5">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${step.bg} ${step.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 text-lg leading-snug">
                          {step.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Video & Action */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-8">
            
            {/* Video Card */}
            <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl ring-8 ring-slate-100">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-white/70 text-xs font-medium uppercase tracking-widest text-[10px]">Tutorial Video</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="relative aspect-video w-full bg-slate-800 flex items-center justify-center overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
                  title="YouTube video"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900 text-white">
                <h4 className="font-semibold mb-2">Видео заавар үзэх</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Системийн үндсэн функцуудыг 5 минутанд багтаасан заавраас сураарай.
                </p>
              </div>
            </div>

            {/* Action Card */}
            <div className="relative group overflow-hidden bg-blue-600 rounded-[2rem] p-8 text-white shadow-lg shadow-blue-200">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
              <h3 className="text-2xl font-bold mb-3 relative z-10">Ургийн бичгээ эхлүүлэх үү?</h3>
              <p className="text-blue-100 text-sm mb-6 relative z-10 leading-relaxed">
                Таны бүртгэсэн мэдээлэл нууцлалын өндөр зэрэглэлд хадгалагдах болно.
              </p>
              <a href='/signup' className="w-full bg-white text-blue-600 py-4 px-6 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors shadow-inner flex items-center justify-center gap-2 relative z-10">
                Одоо эхлэх
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Detail Section */}
        <section className="mt-16 lg:mt-24">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Жишээ логик</h3>
                </div>
                <div className="space-y-4 text-slate-600 leading-relaxed max-w-xl">
                  <p>
                    Та хамгийн түрүүнд өвөөгөө <span className="font-bold text-slate-900 bg-amber-100 px-1 rounded">Бат</span> нэмлээ. 
                    Дараа нь шинэ хүн нэмэхдээ эцэг талбарт нь <span className="font-bold text-slate-900">Бат</span>-ыг сонгоно.
                  </p>
                  <p className="bg-slate-50 p-4 rounded-xl border-l-4 border-blue-500 italic text-sm">
                    Систем автоматаар рекурсив алгоритм ашиглан тэднийг эцэг, хүүгийн холбоосоор модонд дүрслэх болно.
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-4 py-8 px-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center font-bold text-blue-600 shadow-sm">Бат</div>
                <ChevronRight className="text-slate-400" />
                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center font-bold text-slate-400">Дорж</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Work;