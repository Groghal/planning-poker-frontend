interface VoteSummary {
  avgVote: number;
  sortedVotes: [string, number][];
}

interface Votes {
  [username: string]: string;
}

export function calculateSummary(votes: Votes): VoteSummary {
  // Get all the votes as an array
  const voteValues = Object.values(votes);
  
  // Calculate the average vote
  let sum = 0;
  let count = 0;
  
  voteValues.forEach(vote => {
    const numVote = parseFloat(vote);
    if (!isNaN(numVote)) {
      sum += numVote;
      count++;
    }
  });
  
  const avgVote = count > 0 ? sum / count : 0;

  // Count occurrences of each vote
  const voteCounts: { [key: string]: number } = {};
  
  voteValues.forEach(vote => {
    if (!voteCounts[vote]) {
      voteCounts[vote] = 0;
    }
    voteCounts[vote]++;
  });

  // Sort votes by frequency (most frequent first)
  const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);

  return {
    avgVote,
    sortedVotes,
  };
}