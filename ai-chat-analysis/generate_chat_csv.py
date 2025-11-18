"""
generate_chat_csv.py

Generates a synthetic CSV of chat messages to be used by the ai-chat-analysis service.
Usage:
  python generate_chat_csv.py --count 20000

Output:
  synthetic_chats.csv (written to same directory)

Fields:
  message_id, project_id, project_name, sender_id, sender_username, sender_role, channel, text, timestamp

This script avoids external dependencies so it works in plain Python.
"""
import csv
import uuid
import random
import argparse
from datetime import datetime, timedelta

# small set of sample names/roles/projects and text fragments to assemble messages
USER_NAMES = [
    'alice', 'bob', 'carol', 'dave', 'erin', 'frank', 'grace', 'heidi', 'ivan', 'judy',
    'kim', 'leo', 'mallory', 'nancy', 'oscar', 'peggy', 'quentin', 'rachel', 'sam', 'trent'
]
ROLES = ['member', 'team_lead', 'mentor', 'observer']
PROJECTS = [
    ('proj-A', 'Apollo'),
    ('proj-B', 'Beacon'),
    ('proj-C', 'Catalyst'),
    ('proj-D', 'Drift'),
    ('proj-E', 'Eclipse')
]

# sentence fragments to make varied messages
OPENERS = [
    'FYI,', 'Heads up,', 'Quick update:', 'Reminder:', 'Question:', 'Note:', 'Update:'
]
VERBS = [
    'completed', 'started', 'blocked on', 'pushed', 'deployed', 'reviewed', 'assigned', 'created', 'updated'
]
OBJECTS = [
    'task', 'PR', 'ticket', 'issue', 'milestone', 'pipeline', 'dependency', 'test case', 'db migration'
]
TAILS = [
    'please check.', 'will follow up later.', 'needs review.', 'this is urgent.', 'can someone help?',
    'added to backlog.', 'deprioritized for now.', 'merged to main.', 'reverted.', 'LGTM.'
]
SMALL_CHAT = [
    'Looks good to me.', 'Thanks!', 'On it.', 'Working on this now.', 'I will take this.', 'Nice work.'
]

CHANNELS = ['project', 'personal', 'general', 'devops', 'random']


def random_message():
    # build one message by randomly picking fragments
    if random.random() < 0.12:
        # short chat
        return random.choice(SMALL_CHAT)
    if random.random() < 0.05:
        # longer status-type message
        return (
            f"{random.choice(OPENERS)} I {random.choice(VERBS)} the {random.choice(OBJECTS)} "
            f"#{random.randint(1,400)} and {random.choice(TAILS)}"
        )
    # normal sentence
    return f"{random.choice(OPENERS)} {random.choice(VERBS)} {random.choice(OBJECTS)} {random.choice(TAILS)}"


def generate_rows(count, out_path):
    start_time = datetime.utcnow() - timedelta(days=90)
    with open(out_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            'message_id', 'project_id', 'project_name', 'sender_id', 'sender_username',
            'sender_role', 'channel', 'text', 'timestamp'
        ])

        for i in range(count):
            # pick project and user
            project_id, project_name = random.choice(PROJECTS)
            username = random.choice(USER_NAMES)
            sender_id = f"user-{abs(hash(username)) % 100000}"  # stable-ish id
            sender_role = random.choices(ROLES, weights=[70, 10, 10, 10], k=1)[0]
            channel = random.choices(CHANNELS, weights=[60, 10, 15, 10, 5], k=1)[0]

            # create timestamp distributed over last 90 days, but more weight to recent
            days_offset = int(random.paretovariate(1.5)) % 90
            seconds_offset = random.randint(0, 24 * 3600 - 1)
            ts = start_time + timedelta(days=days_offset, seconds=seconds_offset)

            text = random_message()

            message_id = str(uuid.uuid4())

            writer.writerow([
                message_id,
                project_id,
                project_name,
                sender_id,
                username,
                sender_role,
                channel,
                text,
                ts.isoformat() + 'Z'
            ])

            # occasional multi-line / long message
            if i % 5000 == 0 and i != 0:
                # add a conversational block to simulate threads
                for j in range(3):
                    mid = str(uuid.uuid4())
                    reply_ts = ts + timedelta(minutes=j+1)
                    writer.writerow([
                        mid,
                        project_id,
                        project_name,
                        f"user-{random.randint(1000,9999)}",
                        random.choice(USER_NAMES),
                        random.choice(ROLES),
                        channel,
                        "Reply: " + random_message(),
                        reply_ts.isoformat() + 'Z'
                    ])

    print(f"Wrote {count} primary messages (+ occasional thread replies) to {out_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate synthetic chat CSV')
    parser.add_argument('--count', type=int, default=20000, help='number of messages to generate')
    parser.add_argument('--out', type=str, default='synthetic_chats.csv', help='output CSV filename')
    args = parser.parse_args()

    generate_rows(args.count, args.out)
