import logging

logger = logging.getLogger(__name__)

# ======================
# Workflow States
# ======================

STATE_SUBMITTED = "SUBMITTED"
STATE_UNDER_REVIEW = "UNDER_REVIEW"
STATE_ACTION_REQUIRED = "ACTION_REQUIRED"
STATE_VERIFIED = "VERIFIED"
STATE_APPROVED = "APPROVED"
STATE_REJECTED = "REJECTED"


# ======================
# Valid Transitions
# ======================

VALID_TRANSITIONS = {
    STATE_SUBMITTED: [
        STATE_UNDER_REVIEW,
    ],

    STATE_UNDER_REVIEW: [
        STATE_ACTION_REQUIRED,
        STATE_VERIFIED,
        STATE_REJECTED,
    ],

    STATE_ACTION_REQUIRED: [
        STATE_UNDER_REVIEW,
        STATE_REJECTED,
    ],

    STATE_VERIFIED: [
        STATE_APPROVED,
        STATE_REJECTED,
    ],

    STATE_APPROVED: [],

    STATE_REJECTED: [],
}


# ======================
# Role Permissions
# ======================

ROLE_PERMISSIONS = {
    "ADMIN": {
        STATE_UNDER_REVIEW,
        STATE_ACTION_REQUIRED,
        STATE_VERIFIED,
        STATE_APPROVED,
        STATE_REJECTED,
    },

    "OFFICER": {
        STATE_UNDER_REVIEW,
        STATE_ACTION_REQUIRED,
        STATE_VERIFIED,
        STATE_APPROVED,
        STATE_REJECTED,
    },

    "CITIZEN": set(),
}


# ======================
# Custom Exception
# ======================

class InvalidStateTransition(Exception):
    """Raised when a transition is not allowed."""
    pass


# ======================
# Get Next States
# ======================

def get_allowed_next_states(current_state):
    """
    Return valid next states.
    """
    return VALID_TRANSITIONS.get(current_state, [])


# ======================
# Validate State
# ======================

def is_valid_state(state):
    """
    Check whether a state exists.
    """
    return state in VALID_TRANSITIONS


# ======================
# Validate Transition
# ======================

def validate_transition(current_state, target_state, user_role):
    """
    Validate workflow transition.
    """

    if not is_valid_state(current_state):
        raise InvalidStateTransition(
            f"Unknown state: {current_state}"
        )

    if not is_valid_state(target_state):
        raise InvalidStateTransition(
            f"Unknown state: {target_state}"
        )

    allowed_states = get_allowed_next_states(current_state)

    if target_state not in allowed_states:
        raise InvalidStateTransition(
            f"Cannot move from '{current_state}' to '{target_state}'."
        )

    allowed_roles = ROLE_PERMISSIONS.get(user_role, set())

    if target_state not in allowed_roles:
        raise InvalidStateTransition(
            f"{user_role} cannot change status to '{target_state}'."
        )

    logger.info(
        "%s -> %s (%s)",
        current_state,
        target_state,
        user_role,
    )

    return True


# ======================
# Check Transition
# ======================

def can_transition(current_state, target_state, user_role):
    """
    Return True if transition is valid.
    """

    try:
        validate_transition(
            current_state,
            target_state,
            user_role,
        )
        return True

    except InvalidStateTransition:
        return False


# ======================
# Final State
# ======================

def is_terminal_state(state):
    """
    Check whether the workflow is complete.
    """
    return state in {
        STATE_APPROVED,
        STATE_REJECTED,
    }