import React from 'react';
import { Box, Typography, Paper, Button, IconButton, Popover, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import { User } from '../../types/room';

interface UserListProps {
  votes: Record<string, User>;
  votesVisible: boolean;
  onReveal?: () => void;
  onReset?: () => void;
}

type ViewportRect = { left: number; top: number; width: number; height: number };

// Keep these in sync so the flying emoji isn't removed before its animation finishes.
const SMILE_THROW_DURATION_MS = 3600;

const ThrownSmile: React.FC<{
  targetKey: string;
  emoji: string;
}> = ({ targetKey, emoji }) => {
  const elRef = React.useRef<HTMLDivElement | null>(null);
  const hasAnimatedRef = React.useRef(false);

  React.useEffect(() => {
    const el = elRef.current;
    if (!el || hasAnimatedRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    let rafId: number | null = null;
    let animation: Animation | null = null;
    let cancelled = false;

    const getTargetRect = (): ViewportRect | null => {
      if (typeof document === 'undefined') return null;
      const targetEl = document.querySelector<HTMLElement>(`[data-smile-target="${targetKey}"]`);
      if (!targetEl) return null;
      const rect = targetEl.getBoundingClientRect();
      return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    };

    const start = (targetRect: ViewportRect) => {
      // Only mark as "already animated" once we actually have a target to animate to.
      hasAnimatedRef.current = true;

      const endX = targetRect.left + targetRect.width / 2;
      const endY = targetRect.top + targetRect.height / 2;

      // "Throw" from the opposite side of the screen (like tossing paper into a bin).
      const fromRight = endX < window.innerWidth / 2;
      const startX = fromRight ? window.innerWidth + 80 : -80;

      const jitter = (n: number) => (Math.random() * 2 - 1) * n;
      const startY = Math.min(Math.max(endY + jitter(120), 40), window.innerHeight - 40);

      // Make a nice arc: mid point rises above the straight line.
      const midX = (startX + endX) / 2 + jitter(60);
      const midY = (startY + endY) / 2 - (140 + Math.random() * 80);

      // Slow down the "throwing smile" animation a bit so it feels less rushed.
      const duration = prefersReducedMotion ? 450 : SMILE_THROW_DURATION_MS;
      const easing = prefersReducedMotion ? 'ease-out' : 'cubic-bezier(0.15, 0.85, 0.2, 1)';

      const makeTransform = (x: number, y: number, scale: number, rotateDeg: number) =>
        `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale}) rotate(${rotateDeg}deg)`;

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
      const quad = (p0: number, p1: number, p2: number, t: number) => {
        const u = 1 - t;
        return u * u * p0 + 2 * u * t * p1 + t * t * p2;
      };

      // Timing breakdown (by animation progress):
      // - 0..IMPACT_AT: fly to the card
      // - IMPACT_AT..FALL_START: very quick "hit" squash (no noticeable pause)
      // - FALL_START..FADE_START: fall down (like it actually hit the card)
      // - FADE_START..1: fade out only after the fall is clearly visible
      const IMPACT_AT = prefersReducedMotion ? 0.7 : 0.76;
      const IMPACT_WINDOW = prefersReducedMotion ? 0.01 : 0.02;
      const FALL_START = Math.min(0.92, IMPACT_AT + IMPACT_WINDOW);
      const FADE_START = prefersReducedMotion ? 0.9 : 0.95;
      const FALL_DISTANCE = prefersReducedMotion ? 120 : 230;

      // Sample a quadratic bezier so the flight path is smooth (not start->mid->end straight segments).
      const flightOffsets = prefersReducedMotion
        ? [0, 0.22, 0.45, 0.62, IMPACT_AT]
        : [0, 0.1, 0.2, 0.32, 0.44, 0.56, 0.66, 0.72, IMPACT_AT];

      const flightKeyframes = flightOffsets.map((offset) => {
        const t = clamp01(offset / IMPACT_AT); // normalize so we reach the target exactly at IMPACT_AT
        const x = quad(startX, midX, endX, t);
        const y = quad(startY, midY, endY, t);

        // Stay readable at the end; don't shrink into nothing.
        const scale = t <= 0.6 ? lerp(1.08, 1.22, t / 0.6) : lerp(1.22, 1.0, (t - 0.6) / 0.4);
        const rotate = lerp(0, 520, t);

        const opacity = clamp01(offset / 0.06); // quick fade-in only

        return { transform: makeTransform(x, y, scale, rotate), opacity, offset };
      });

      // Impact + fall + fade
      // Add some randomness so the drop doesn't look synthetic (always same X/rotation).
      const fallDriftX = jitter(prefersReducedMotion ? 18 : 85);
      const fallDriftX2 = fallDriftX + jitter(prefersReducedMotion ? 10 : 35);
      const impactRotate = 540 + jitter(prefersReducedMotion ? 10 : 45);
      const fallRotate1 = impactRotate + 25 + jitter(prefersReducedMotion ? 10 : 35);
      const fallRotate2 = fallRotate1 + 60 + jitter(prefersReducedMotion ? 15 : 70);

      const impactKick = prefersReducedMotion ? 4 : 10;

      const impactKeyframes: Keyframe[] = [
        // impact moment (arrive)
        { transform: makeTransform(endX, endY, 1.08, impactRotate), opacity: 1, offset: IMPACT_AT },
        // quick "hit" squash + tiny sideways kick (no pause)
        {
          transform: makeTransform(endX + impactKick * 0.35, endY + impactKick, 0.96, fallRotate1),
          opacity: 1,
          offset: IMPACT_AT + IMPACT_WINDOW * 0.45
        },
        // immediately transition into the fall
        { transform: makeTransform(endX + impactKick * 0.2, endY + impactKick * 0.4, 1.01, fallRotate1), opacity: 1, offset: FALL_START },
        // start falling
        {
          transform: makeTransform(endX + fallDriftX * 0.35, endY + FALL_DISTANCE * 0.5, 0.98, fallRotate1),
          opacity: 1,
          offset: lerp(FALL_START, FADE_START, 0.5)
        },
        // end of fall (still fully visible)
        { transform: makeTransform(endX + fallDriftX2, endY + FALL_DISTANCE, 0.92, fallRotate2), opacity: 1, offset: FADE_START },
        // now fade out after the fall
        { transform: makeTransform(endX + fallDriftX2 + jitter(prefersReducedMotion ? 6 : 18), endY + FALL_DISTANCE + 28, 0.9, fallRotate2 + 10), opacity: 0, offset: 1 },
      ];

      const keyframes: Keyframe[] = [...flightKeyframes, ...impactKeyframes];

      animation = el.animate(keyframes, { duration, easing, fill: 'forwards' });
    };

    // Retry a bit to allow refs/layout to settle (ref callbacks don't trigger rerenders).
    const maxFrames = 60; // ~1s at 60fps
    let frames = 0;
    const tick = () => {
      if (cancelled || hasAnimatedRef.current) return;
      const rect = getTargetRect();
      if (rect) {
        start(rect);
        return;
      }
      frames += 1;
      if (frames < maxFrames) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      animation?.cancel();
    };
  }, [targetKey]);

  return (
    <Box
      ref={elRef}
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 2000,
        pointerEvents: 'none',
        fontSize: '2rem',
        width: '40px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.35))',
        opacity: 0, // stay hidden until the Web Animations API drives opacity in
      }}
    >
      {emoji}
    </Box>
  );
};

const DEFAULT_SMILE = '😃';
const SMILE_GRID: string[] = [
  // Faces (smiles / expressions)
  '😀','😃','😄','😁','😆','😅','🤣','😂','🥲','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙',
  '😋','😛','😜','🤪','😝','🤑','🤗','🫠','🫡','🤭','🫢','🫣','🤫','🤔','🤐','🤨','😐','😑','😶','😶‍🌫️','🫥','😏','😒','🙄','😬','😮‍💨',
  '🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','😵‍💫','🤯','🤠','🥳',
  '😎','🥸','🤓','🧐','😕','🫤','😟','🙁','☹️','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭',
  '😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','👻','👽','🤖','🤡','💩',

  // Cat faces
  '😺','😸','😹','😻','😼','😽','🙀','😿','😾',

  // Monkeys
  '🙈','🙉','🙊',

  // Quick reactions (still handy to "throw")
  '👍','👎','👏','🙌','🤝','🫶','💪','🔥','✨','💫','💥','💯','🎉','🎊',

  // Hearts
  '💖','💘','💝','💗','💓','💕','💞','💟','❣️','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','❤️‍🔥','❤️‍🩹'
];

export const UserList: React.FC<UserListProps & {
  onSendSmile?: (toUsername: string, emoji: string) => void;
  incomingSmile?: { from: string; to: string; emoji: string; id: number } | null;
}> = ({
  votes,
  votesVisible,
  onReveal,
  onReset,
  onSendSmile,
  incomingSmile
}) => {
    const [activeSmiles, setActiveSmiles] = React.useState<Array<{ id: number, from: string, to: string, emoji: string, startTime: number }>>([]);
    const [selectedEmoji, setSelectedEmoji] = React.useState<string>(() => {
      return localStorage.getItem('planning-poker-selected-emoji') || DEFAULT_SMILE;
    });
    const [pickerAnchor, setPickerAnchor] = React.useState<HTMLElement | null>(null);
    const [pickerForUser, setPickerForUser] = React.useState<string | null>(null);

    // Handle incoming new smiles
    React.useEffect(() => {
      if (incomingSmile) {
        setActiveSmiles(prev => [...prev, { ...incomingSmile, startTime: Date.now() }]);

        // Cleanup after animation
        const timer = setTimeout(() => {
          setActiveSmiles(prev => prev.filter(s => s.id !== incomingSmile.id));
        }, SMILE_THROW_DURATION_MS + 150); // keep in sync with the animation duration
        return () => clearTimeout(timer);
      }
    }, [incomingSmile]);

    React.useEffect(() => {
      try {
        localStorage.setItem('planning-poker-selected-emoji', selectedEmoji);
      } catch {
        // ignore storage failures
      }
    }, [selectedEmoji]);

    // Check if a user has voted
    const hasVoted = (username: string) => {
      const userVote = votes[username]?.vote;
      return userVote === "voted" || (userVote && userVote !== "not_voted");
    };

    // Get the display value for a vote
    const getVoteDisplay = (username: string) => {
      const userVote = votes[username]?.vote;

      if (!votesVisible) {
        // When votes are not revealed, show check or question mark
        if (!userVote || userVote === "not_voted") {
          return <HelpIcon fontSize="medium" sx={{ color: "#ecf0f1" }} />;
        } else if (userVote === "voted") {
          return <CheckCircleIcon fontSize="medium" color="success" />;
        } else {
          // If it's an actual vote value but votes aren't visible
          return <CheckCircleIcon fontSize="medium" color="success" />;
        }
      } else {
        // When votes are revealed, show actual value or question mark
        if (!userVote || userVote === "not_voted") {
          return <HelpIcon fontSize="medium" sx={{ color: "#ecf0f1" }} />;
        } else if (userVote === "voted") {
          // This shouldn't happen when votes are revealed, but just in case
          return <CheckCircleIcon fontSize="medium" color="success" />;
        } else {
          // Show the actual vote value
          return userVote;
        }
      }
    };

    // Get list of usernames, sorted for consistency
    const usernames = Object.keys(votes).sort();

    // Position users around the table in alternating top/bottom pattern
    const calculatePosition = (index: number, total: number) => {
      // Simplest approach: alternate between top and bottom
      const isTopPosition = index % 2 === 0;

      // Calculate horizontal position
      let horizontalSpacing;

      if (total <= 6) {
        const topCount = Math.ceil(total / 2);
        const bottomCount = Math.floor(total / 2);

        if (isTopPosition) {
          const topIndex = Math.floor(index / 2);
          horizontalSpacing = 100 / (topCount + 1);
          const leftPosition = (topIndex + 1) * horizontalSpacing;

          return {
            top: '-75px',
            left: `${leftPosition}%`,
            transform: 'translateX(-50%)'
          };
        } else {
          const bottomIndex = Math.floor(index / 2);
          horizontalSpacing = 100 / (bottomCount + 1);
          const leftPosition = (bottomIndex + 1) * horizontalSpacing;

          return {
            top: '140px',
            left: `${leftPosition}%`,
            transform: 'translateX(-50%)'
          };
        }
      } else {
        const positionInRow = Math.floor(index / 2);
        const totalInRow = Math.ceil(total / 2);
        horizontalSpacing = 100 / (totalInRow + 1);
        const leftPosition = (positionInRow + 1) * horizontalSpacing;

        return {
          top: isTopPosition ? '-75px' : '140px',
          left: `${leftPosition}%`,
          transform: 'translateX(-50%)'
        };
      }
    };

    return (
      <Box sx={{ position: 'relative', mt: 4, mb: 10 }}>
        {/* Flying Smiles */}


        {/* Flying Smiles */}
        {activeSmiles.map((smile) => {
          return (
            <ThrownSmile
              key={smile.id}
              targetKey={encodeURIComponent(smile.to)}
              emoji={smile.emoji || DEFAULT_SMILE}
            />
          );
        })}

        {/* Virtual table */}
        <Paper
          elevation={3}
          sx={{
            backgroundColor: '#1e2a38', // Darker background
            height: '180px',
            borderRadius: '30px',
            border: '10px solid #2c3e50',
            position: 'relative',
            mb: 8, // Make room for names below card
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }}
        >
          {/* Table buttons in center */}
          {(onReveal || onReset) && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              gap: 2,
              zIndex: 10
            }}>
              {!votesVisible && onReveal && (
                <Button
                  variant="contained"
                  startIcon={<VisibilityIcon />}
                  onClick={onReveal}
                  sx={{
                    backgroundColor: '#27ae60',
                    color: '#ecf0f1',
                    fontWeight: 'bold',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#2ecc71',
                    }
                  }}
                >
                  Reveal Votes
                </Button>
              )}

              {onReset && (
                <Button
                  variant="contained"
                  startIcon={<RestartAltIcon />}
                  onClick={() => {
                    onReset();
                  }}
                  sx={{
                    backgroundColor: '#d35400',
                    color: '#ecf0f1',
                    fontWeight: 'bold',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#e67e22',
                    }
                  }}
                >
                  Reset
                </Button>
              )}
            </Box>
          )}

          {/* Place users around the table */}
          {usernames.map((username, index) => {
            const position = calculatePosition(index, usernames.length);
            const userHasVoted = hasVoted(username);

            return (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  textAlign: 'center',
                  top: position.top,
                  left: position.left,
                  transform: position.transform,
                  zIndex: 5
                }}
              >
                {/* Card (vote) */}
                <Paper
                  elevation={5}
                  onClick={() => onSendSmile?.(username, selectedEmoji)}
                  data-smile-target={encodeURIComponent(username)}
                  sx={{
                    width: '60px',
                    height: '90px',
                    borderRadius: '10px',
                    backgroundColor: userHasVoted ? '#3498db' : '#95a5a6',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '2px solid #ecf0f1',
                    mb: 1,
                    transition: 'all 0.3s ease',
                    transform: userHasVoted ? 'translateY(-10px)' : 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible',
                    '& .smileHoverBtn': {
                      opacity: 0,
                      transform: 'scale(0.85)',
                      transition: 'opacity 150ms ease, transform 150ms ease',
                    },
                    '&:hover .smileHoverBtn': {
                      opacity: 1,
                      transform: 'scale(1)',
                    },
                    '&:hover': {
                      transform: 'translateY(-15px) scale(1.05)',
                      boxShadow: '0 0 15px rgba(243, 156, 18, 0.7)' // Gold glow on hover
                    }
                  }}
                >
                  <Tooltip title="Choose emoji to throw" placement="top">
                    <IconButton
                      className="smileHoverBtn"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPickerAnchor(e.currentTarget);
                        setPickerForUser(username);
                      }}
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: -12,
                        width: 28,
                        height: 28,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(255,255,255,0.35)',
                        backdropFilter: 'blur(4px)',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' }
                      }}
                    >
                      <Box sx={{ fontSize: '1rem', lineHeight: 1 }}>{selectedEmoji}</Box>
                    </IconButton>
                  </Tooltip>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#ecf0f1',
                      fontWeight: 'bold',
                      fontSize: '1.8rem'
                    }}
                  >
                    {getVoteDisplay(username)}
                  </Typography>
                </Paper>

                {/* Username */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#ecf0f1',
                    mt: 1,
                    maxWidth: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {username}
                </Typography>
              </Box>
            );
          })}
        </Paper>

        <Popover
          open={Boolean(pickerAnchor)}
          anchorEl={pickerAnchor}
          onClose={() => {
            setPickerAnchor(null);
            setPickerForUser(null);
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          PaperProps={{
            sx: {
              p: 1,
              backgroundColor: '#0f1720',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
            }
          }}
        >
          <Box sx={{ px: 1, pb: 0.5, color: '#ecf0f1', fontSize: '0.8rem', opacity: 0.85 }}>
            {pickerForUser ? `Pick an emoji to throw at ${pickerForUser}` : 'Pick an emoji'}
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 32px)',
              gap: 0.5,
              p: 0.5,
              maxWidth: 10 * 32 + 9 * 4,
            }}
          >
            {SMILE_GRID.map((emo) => (
              <IconButton
                key={emo}
                size="small"
                onClick={() => {
                  setSelectedEmoji(emo);
                  setPickerAnchor(null);
                  setPickerForUser(null);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  border: emo === selectedEmoji ? '1px solid rgba(46, 204, 113, 0.9)' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: emo === selectedEmoji ? 'rgba(46, 204, 113, 0.15)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <Box sx={{ fontSize: '1.05rem', lineHeight: 1 }}>{emo}</Box>
              </IconButton>
            ))}
          </Box>
        </Popover>
      </Box>
    );
  };