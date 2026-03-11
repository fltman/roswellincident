import { useEffect, useRef, useState, useCallback } from 'react';

const B = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const TRACKS = {
  // Global tracks (views)
  intro: B + '/music/ROSWELL — Main Theme.mp3',
  map: B + '/music/NIGHT DESERT — Exploration Theme.mp3',
  chat: B + '/music/NIGHT DESERT — Exploration Theme.mp3',
  board: B + '/music/INVESTIGATION BOARD — Detective at 3 AM.mp3',
  // Per-location tracks
  loc_foster_ranch: B + '/music/FOSTER RANCH — The Debris Field.mp3',
  loc_proctor_ranch: B + '/music/PROCTOR RANCH — The Neighbors Knew.mp3',
  loc_sheriff_office: B + "/music/SHERIFF'S OFFICE — Over His Head.mp3",
  loc_brazel_ranch_house: B + "/music/BRAZEL'S RANCH HOUSE — Isolation.mp3",
  loc_raaf_headquarters: B + '/music/RAAF HEADQUARTERS — The 509th.mp3',
  loc_marcel_house: B + '/music/MARCEL HOUSE — 2 AM Kitchen.mp3',
  loc_cic_office: B + '/music/CIC OFFICE — Classified.mp3',
  loc_corona_store: B + '/music/CORONA STORE — Desert Crossroads.mp3',
  loc_radio_kgfl: B + '/music/RADIO KGFL — The Bulletin.mp3',
  loc_roswell_daily_record: B + '/music/ROSWELL DAILY RECORD — Stop the Press.mp3',
  loc_hangar_84: B + "/music/HANGAR 84 — What's Inside.mp3",
  loc_highway_285_cordon: B + '/music/HIGHWAY 285 — The Cordon.mp3',
  loc_whitmore_house: B + '/music/WHITMORE HOUSE — Secret Recording.mp3',
  loc_main_street_roswell: B + '/music/MAIN STREET ROSWELL — The Prisoner.mp3',
  loc_raaf_flight_line: B + '/music/RAAF FLIGHT LINE — Loading Cargo.mp3',
  loc_raaf_hospital: B + '/music/RAAF HOSPITAL — Strange Activity.mp3',
  loc_ballard_funeral_home: B + '/music/BALLARD FUNERAL HOME — Child-Sized Caskets.mp3',
  loc_fire_station: B + '/music/FIRE STATION — The Metal That Moved.mp3',
  loc_fort_worth_ramey: B + '/music/FORT WORTH — The Cover Story.mp3',
  loc_second_crash_site: B + '/music/SECOND CRASH SITE — The Intact Craft.mp3',
  loc_fort_worth_map_room: B + '/music/FORT WORTH MAP ROOM — The Real Orders.mp3',
  loc_alamogordo: B + '/music/ALAMOGORDO — Project Mogul.mp3',
  loc_pentagon: B + '/music/THE PENTAGON — Orders From Above.mp3',
  loc_wright_patterson: B + '/music/WRIGHT-PATTERSON — Hangar 18.mp3',
};

const STINGER = B + '/music/CLUE DISCOVERED — Stinger.mp3';
const FADE_MS = 1500;
const FADE_STEP = 50;

const LOCATION_TRACKS = {
  foster_ranch: 'loc_foster_ranch',
  proctor_ranch: 'loc_proctor_ranch',
  sheriff_office: 'loc_sheriff_office',
  brazel_ranch_house: 'loc_brazel_ranch_house',
  raaf_headquarters: 'loc_raaf_headquarters',
  marcel_house: 'loc_marcel_house',
  cic_office: 'loc_cic_office',
  corona_store: 'loc_corona_store',
  radio_kgfl: 'loc_radio_kgfl',
  roswell_daily_record: 'loc_roswell_daily_record',
  hangar_84: 'loc_hangar_84',
  highway_285_cordon: 'loc_highway_285_cordon',
  whitmore_house: 'loc_whitmore_house',
  main_street_roswell: 'loc_main_street_roswell',
  raaf_flight_line: 'loc_raaf_flight_line',
  raaf_hospital: 'loc_raaf_hospital',
  ballard_funeral_home: 'loc_ballard_funeral_home',
  fire_station: 'loc_fire_station',
  fort_worth_ramey: 'loc_fort_worth_ramey',
  second_crash_site: 'loc_second_crash_site',
  fort_worth_map_room: 'loc_fort_worth_map_room',
  alamogordo: 'loc_alamogordo',
  pentagon: 'loc_pentagon',
  wright_patterson: 'loc_wright_patterson',
};

export function resolveTrack(view, locationId) {
  if (view === 'intro') return 'intro';
  if (view === 'board') return 'board';
  if (view === 'chat' || view === 'location' || view === 'map') {
    if (locationId && LOCATION_TRACKS[locationId]) {
      return LOCATION_TRACKS[locationId];
    }
    return view === 'chat' ? 'chat' : 'map';
  }
  return 'map';
}

export function useMusic() {
  const audioRef = useRef(null);
  const stingerRef = useRef(null);
  const currentTrackRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(0.3);
  const [muted, setMuted] = useState(false);
  const fadeInterval = useRef(null);

  // Init audio elements
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0;
    stingerRef.current = new Audio(STINGER);
    stingerRef.current.volume = 0.4;
    return () => {
      audioRef.current?.pause();
      stingerRef.current?.pause();
      if (fadeInterval.current) clearInterval(fadeInterval.current);
    };
  }, []);

  // Update volume when muted/volume changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [muted, volume, currentTrack]);

  const switchTrack = useCallback((trackKey) => {
    // Use ref for instant check (avoids stale closure)
    if (trackKey === currentTrackRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    const targetUrl = TRACKS[trackKey];
    if (!targetUrl) return;

    // Clear any existing fade
    if (fadeInterval.current) clearInterval(fadeInterval.current);
    fadeInterval.current = null;

    const prevTrack = currentTrackRef.current;
    currentTrackRef.current = trackKey;
    setCurrentTrack(trackKey);

    if (!prevTrack) {
      // First play — just start
      audio.src = targetUrl;
      audio.volume = muted ? 0 : volume;
      audio.play().catch(() => {});
      return;
    }

    // Crossfade: fade out then switch
    const startVol = audio.volume;
    const steps = FADE_MS / FADE_STEP;
    let step = 0;

    fadeInterval.current = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVol * (1 - step / steps));

      if (step >= steps) {
        clearInterval(fadeInterval.current);
        fadeInterval.current = null;
        audio.pause();
        audio.src = targetUrl;
        audio.volume = 0;
        audio.play().catch(() => {});

        // Fade in
        let inStep = 0;
        const targetVol = muted ? 0 : volume;
        fadeInterval.current = setInterval(() => {
          inStep++;
          audio.volume = Math.min(targetVol, targetVol * (inStep / steps));
          if (inStep >= steps) {
            clearInterval(fadeInterval.current);
            fadeInterval.current = null;
          }
        }, FADE_STEP);
      }
    }, FADE_STEP);
  }, [volume, muted]);

  const playStinger = useCallback(() => {
    const stinger = stingerRef.current;
    if (!stinger || muted) return;
    stinger.currentTime = 0;
    stinger.volume = 0.4;
    stinger.play().catch(() => {});
  }, [muted]);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  return { switchTrack, playStinger, volume, setVolume, muted, toggleMute, currentTrack };
}
