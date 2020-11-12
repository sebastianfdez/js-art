import { Injectable } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import WaveformData from 'waveform-data';
import * as Peaks from 'peaks.js';
import { PeaksOptions } from 'peaks.js';
import { runInThisContext } from 'vm';

@Injectable()
export class JSArtSoundService {
  recorder: RecordRTC = null;
  blobSubject: BehaviorSubject<Blob> = new BehaviorSubject<Blob>(null);
  peakSubject: BehaviorSubject<Peaks.PeaksInstance> = new BehaviorSubject<Peaks.PeaksInstance>(null);
  audioContext = new AudioContext();
  peak: Peaks.PeaksInstance = null;

  constructor() {
    // RecordRTC
    // navigator.mediaDevices.getUserMedia({
    //   video: false,
    //   audio: true
    // }).then((camera) => {
    //   const ondataavailable = (blob: Blob) => {
    //     console.log({ blob });
    //     this.blobSubject.next(blob);
    //   };
    //   const recordingHints = {
    //     type: 'audio',
    //     timeSlice: 1000,
    //     mimeType: 'audio/wav',
    //     recorderType: RecordRTC.StereoAudioRecorder, // force for all browsers
    //     numberOfAudioChannels: 1,
    //     ondataavailable: ondataavailable,
    //   };
  
    //   // initiating the recorder
    //   this.recorder = RecordRTC(camera, recordingHints);
    //   this.startRecording();
    // });
  }

  init(overview: HTMLElement, zoomview: HTMLElement, mediaElement: HTMLAudioElement): Observable<Peaks.PeaksInstance> {
    const options: PeaksOptions = {
      containers: {
        overview,
        zoomview,
      },
      mediaElement,
      webAudio: {
        // audioBuffer: audioBuffer,
        audioContext: this.audioContext,
      }
    };
    console.log("init");
    // this.peak = Peaks.init(options, this.peakCallback.bind(this));
    // this.peak.on(("points.mouseenter"), (point) => console.log(point));
    // this.peak.on(("points.dragend"), (point) => console.log(point));
    // this.peak.on(("zoom.update"), (point) => console.log(point));
    // this.peak.on('zoomview.dblclick', (point) => console.log(point));
    // this.peak.segments.add({ startTime: 0, endTime: 10.5 });
    // this.peak.points.add({ time: 3.5 });
    // this.peak.player.play();
    // console.log(this.peak.views);
    // console.log(this.peak.views.getView('overview'));
    // console.log(this.peak.views.getView('zoomview'));
    return this.peakSubject.asObservable();
  }

  peakCallback(err: Error, peaks: Peaks.PeaksInstance) {
    // console.log({ peaks });
    // console.log({ error: err });
    // console.log(this.peak.segments.getSegments()[0]);
    this.peakSubject.next(peaks);
  }
  
  listenSound(): Observable<Blob> {
    return this.blobSubject.asObservable();
  }

  startRecording() {
    // this.recorder.startRecording();

    // auto stop recording after 5 seconds
    const milliSeconds = 5 * 1000;
    setTimeout(() => {
        // stop recording
        this.recorder.stopRecording(() => {
            // get recorded blob
            const blob = this.recorder.getBlob();
        });
    }, milliSeconds);
  }

  // getInfo(blob: Blob, overview: HTMLElement, zoomview: HTMLElement, mediaElement: HTMLAudioElement): Observable<Peaks.PeaksInstance> {
  getInfo(blob: Blob): Observable<Peaks.PeaksInstance> {
    return from(blob.arrayBuffer()).pipe(
      switchMap((value) => from(this.audioContext.decodeAudioData(value))),
      switchMap((audioBuffer: AudioBuffer) => {
        const options: Peaks.SetSourceOptions = {
          mediaUrl: "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3",
          webAudio: {
            audioBuffer: audioBuffer,
            multiChannel: true,
          }
        }
        this.peak.setSource(options, (error) => console.log(error));
        return this.peakSubject.asObservable();
      })
    );
  }

  getInfoWave(blob: Blob): Observable<WaveformData> {
    console.log('receive blob:', blob);
    return from(blob.arrayBuffer()).pipe(
      tap((ab) => console.log(ab)),
      map((ab) => WaveformData.create(ab))
    );
  }
}
