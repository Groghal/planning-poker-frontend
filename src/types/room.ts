export interface User {
  id: string;
  username: string;
  vote: string | null;
}

export interface Room {
  id: string;
  users: Record<string, User>;
  votes: Record<string, string>;
  showVotes: boolean;
  host: string;
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
  users: Record<string, User>;
  votes: Record<string, string>;
  votesVisible: boolean;
  username: string;
  open: boolean;
  roomNotFound: boolean;
  voteOptions: string[];
  voteOptionsInput: string;
}

export type VoteOption = string;