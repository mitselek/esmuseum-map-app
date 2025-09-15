#!/bin/bash

echo "🎮 BLIND TIMER EXPERIMENT"
echo "========================="
echo "This script will ask you for:"
echo "1. Timer duration (in seconds)"
echo "2. Secret instructions for the AI"
echo "Then it will wait and reveal the instructions!"
echo ""

# Get timer duration (hidden from AI)
echo -n "Enter timer duration in seconds: "
read -s TIMER_SECONDS
echo ""
echo "Timer set (AI cannot see the duration)"

# Get secret instructions (hidden from AI)
echo -n "Enter secret instructions for AI: "
read -s INSTRUCTIONS
echo ""
echo "Instructions recorded (AI cannot see what you typed)"

echo ""
echo "🕐 Starting timer... AI won't see anything until it's done!"
echo "You can now go back to the AI and it will be completely blind to what happens next."

# Silent countdown
for ((i=TIMER_SECONDS; i>0; i--)); do
    sleep 1
done

# Reveal the instructions dramatically
echo ""
echo "⏰ TIMER FINISHED!"
echo "==================="
echo ""
echo "🎯 INSTRUCTIONS FOR AI:"
echo "📋 $INSTRUCTIONS"
echo ""
echo "AI should now follow these instructions!"