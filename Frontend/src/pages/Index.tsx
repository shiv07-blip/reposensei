import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
// import "../App.css"
import { PairProgrammingAssistant } from "@/components/PairProgrammingAssistant"

const App: React.FC = () => {
  const [isJoined, setIsJoined] = useState<boolean>(false)
  const [userName, setUserName] = useState<string>("")
  const [roomId, setRoomId] = useState<string>("")
  const [userId] = useState<string>(() => Math.random().toString(36).substr(2, 9))

  const joinChat = (): void => {
    if (userName.trim() && roomId.trim()) {
      setIsJoined(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      joinChat()
    }
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Join Two-Person Chat</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
              <Input
                value={userName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Room ID</label>
              <Input
                value={roomId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter room ID"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <Button
              onClick={joinChat}
              disabled={!userName.trim() || !roomId.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Join Chat
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="w-full mx-auto">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h1 className="text-xl font-bold text-white mb-4">Two-Person Chat - Room: {roomId}</h1>
          <PairProgrammingAssistant userId={userId} userName={userName} roomId={roomId} />
        </div>
      </div>
    </div>
  )
}

export default App
