import { Injectable } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import WaveformData from 'waveform-data';

@Injectable()
export class JSArtSoundService {
  recorder: RecordRTC = null;
  blobSubject: BehaviorSubject<Blob> = new BehaviorSubject<Blob>(null);
  audioContext = new AudioContext();
  started = false;

  constructor() {
    // RecordRTC
    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    }).then((audio) => {
      const ondataavailable = (blob: Blob) => {
        this.blobSubject.next(blob);
      };
      const recordingHints = {
        type: 'audio',
        timeSlice: 50,
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder, // force for all browsers
        numberOfAudioChannels: 1,
        ondataavailable: ondataavailable,
      };
  
      // initiating the recorder
      this.recorder = RecordRTC(audio, recordingHints);
    });
  }

  record() {
    if (!this.started) {
      this.recorder.startRecording();
      this.started = true;
      return;
    }
    this.recorder.resumeRecording();
  }

  stop() {
    this.recorder.pauseRecording();
  }
  
  listenSound(): Observable<Blob> {
    return this.blobSubject.asObservable();
  }

  getInfoWave(blob: Blob): Observable<WaveformData> {
    return from(blob.arrayBuffer()).pipe(
      switchMap((ab) => {
        const options = {
          audio_context: this.audioContext,
          array_buffer: ab,
          scale: 128,
        };
        return from(new Promise((resolve: (value: WaveformData) => void, reject) => {
          WaveformData.createFromAudio(options, (err, waveform: WaveformData) => {
            if (err) {
              reject(err);
            } else {
              resolve(waveform);
            }
          });
        }));
      }),
    );
  }
}
