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

  constructor() {
    // RecordRTC
    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    }).then((camera) => {
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
      this.recorder = RecordRTC(camera, recordingHints);
      this.startRecording();
    });
  }
  
  listenSound(): Observable<Blob> {
    return this.blobSubject.asObservable();
  }

  startRecording() {
    this.recorder.startRecording();

    // auto stop recording after 5 seconds
    const milliSeconds = 60 * 1000;
    setTimeout(() => {
        // stop recording
        this.recorder.stopRecording(() => {
            // get recorded blob
            const blob = this.recorder.getBlob();
        });
    }, milliSeconds);
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
