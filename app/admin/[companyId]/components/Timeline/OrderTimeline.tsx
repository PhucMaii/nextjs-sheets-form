import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineContent,
  TimelineConnector,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import { IOrderAction, IOrderTimeline } from '@/app/utils/type';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';
import { grey } from '@mui/material/colors';
import ReactMarkdown from 'react-markdown';
import '../../../../../styles/react-markdown.css';

interface IProps {
  timeline: IOrderTimeline | null;
}

export default function OrderTimeline({ timeline }: IProps) {
  return (
    <Timeline sx={{ width: '100%' }}>
      {Object.keys(timeline?.groupedActions || {}).map((date) => (
        <>
          <Typography variant="subtitle2" sx={{ color: grey[700] }} key={date}>
            {new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
          <Timeline>
            {timeline?.groupedActions[date].map((action: IOrderAction) => {
              if (!action.comment) {
                return (
                  <TimelineItem key={action.id}>
                    <TimelineOppositeContent style={{ flex: 0.1 }}>
                      <Typography variant="caption" color={grey[700]}>
                        {new Date(action.createdAt).toLocaleTimeString(
                          'en-US',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot
                        style={{
                          borderRadius: '0',
                          backgroundColor: grey[800],
                        }}
                      />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Box
                        sx={{
                          // backgroundColor: grey[100],
                          // padding: 1,
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="subtitle1">
                          {action.title}
                        </Typography>
                      </Box>
                    </TimelineContent>
                  </TimelineItem>
                );
              }
              return (
                <TimelineItem key={action.id}>
                  <TimelineOppositeContent style={{ flex: 0.1 }}>
                    <Typography variant="caption" color={grey[700]}>
                      {new Date(action.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot
                      style={{
                        borderRadius: '0',
                        backgroundColor: grey[800],
                      }}
                    />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Accordion elevation={0} sx={{ boxShadow: 'rgba(131, 131, 131, 0.25) 0px 6px 12px -2px, rgba(118, 118, 118, 0.3) 0px 3px 7px -3px'}}>
                      <AccordionSummary
                        expandIcon={
                          action.comment ? <ExpandMoreIcon /> : undefined
                        }
                      >
                        <Typography variant="subtitle1">
                          {action.title}
                        </Typography>
                      </AccordionSummary>
                      {action.comment && (
                        <AccordionDetails>
                          <div className="reactMarkDown">
                            <ReactMarkdown>{action.comment}</ReactMarkdown>
                          </div>
                        </AccordionDetails>
                      )}
                    </Accordion>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        </>
      ))}
    </Timeline>
  );
}
