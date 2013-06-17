package DDG::Spice::DNS;
# ABSTRACT: Gets IP address of given domain name.

use DDG::Spice;
use Data::Validate::Domain qw(is_domain);

spice to => 'http://pro.viewdns.info/dnsrecord/?domain=$2&recordtype=$1&apikey={{ENV{DDG_SPICE_VIEWDNS_APIKEY}}}&output=json';

spice wrap_jsonp_callback => 1;

primary_example_queries 'dns viewdns.info';
description 'IP address of domain';
name 'DNS';
attribution github => ['https://www.github.com/OndroNR', 'Ondrej Galbavy'],
            twitter => ['https://www.twitter.com/OndroNR', 'Ondrej Galbavy'];

triggers any => 'dns', 'record';

spice from => '(.*)/(.*)';

handle query_lc => sub {
    s/(?:(a|aaaa|afsdb|apl|caa|cert|cname|dhcid|dlv|dname|dnskey|ds|hip|ipseckey|key|kx|loc|mx|naptr|ns|nsec|nsec3|nsec3param|ptr|rrsig|rp|sig|soa|spf|srv|sshfp|ta|tkey|tlsa|tsig|tx)\s+)?(record|dns)\s+//;
    my $record = defined $1 ? $1 : '*';
	return uc $record, $_ if is_domain $_;
    return;
};

1;
