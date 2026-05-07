export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-800" />
          <div className="px-8 pb-8">
            <div className="relative -top-12 mb-[-32px]">
              <div className="w-24 h-24 bg-white rounded-full p-1">
                <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-white">👤</span>
                </div>
              </div>
            </div>
            <div className="pt-16">
              <h1 className="text-3xl font-bold text-gray-900">John Doe</h1>
              <p className="text-gray-600 mb-6">Computer Science Student • Class of 2026</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-gray-600">Events Attended</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">5</p>
                  <p className="text-sm text-gray-600">Clubs Joined</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-sm text-gray-600">Items Listed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



