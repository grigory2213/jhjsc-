import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Mic, Square } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function TaskDetails({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { data: task, isLoading } = useQuery<Task>({
    queryKey: [`/api/tasks/${params.id}`],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await apiRequest("PATCH", `/api/tasks/${params.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${params.id}`] });
    },
  });

  const uploadAudioMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.mp3");
      const res = await fetch(`/api/tasks/${params.id}/audio`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload audio");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${params.id}`] });
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/mpeg" });
        uploadAudioMutation.mutate(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  if (isLoading || !task) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold mb-4">{task.title}</h1>
              <p className="text-muted-foreground mb-8">{task.description}</p>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Location</h2>
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <MapContainer
                      center={
                        task.latitude && task.longitude
                          ? [parseFloat(task.latitude), parseFloat(task.longitude)]
                          : [51.505, -0.09]
                      }
                      zoom={13}
                      className="h-full"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker
                        onLocationSelect={(lat, lng) =>
                          updateTaskMutation.mutate({
                            latitude: lat.toString(),
                            longitude: lng.toString(),
                          })
                        }
                      />
                      {task.latitude && task.longitude && (
                        <Marker
                          position={[
                            parseFloat(task.latitude),
                            parseFloat(task.longitude),
                          ]}
                        />
                      )}
                    </MapContainer>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2">Audio Note</h2>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {!isRecording ? (
                        <Button onClick={startRecording}>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={stopRecording}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </div>
                    {task.audioUrl && (
                      <audio controls className="w-full">
                        <source src={task.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
