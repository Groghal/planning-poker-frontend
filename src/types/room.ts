export interface User {
  id: string;
  vote: string | null;
}

export interface Room {
  id: string;
  votes: Record<string, User>;
  showVotes: boolean;
  host: string;
  voteOptions: string[];
}

export interface VoteSummary {
  average: number | null;
  min: number | null;
  max: number | null;
  consensus: number;
  mostCommonVote: string | null;
  nonNumeric: string[];
}

export interface RoomState {
  loading: boolean;
  votes: Record<string, User>;
  votesVisible: boolean;
  username: string;
  open: boolean;
  roomNotFound: boolean;
  voteOptions: string[];
  voteOptionsInput: string;
}

export type VoteOption = string;